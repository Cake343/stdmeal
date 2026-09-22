/**
 * Testy kompilatora promptu — czyli jedynej rzeczy, ktorej zepsucie
 * bylo by widac dopiero w czacie, po wklejeniu bzdury.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { compile, estimateTokens, stats } from '../src/js/prompt/compile.js';
import { defaultState, sanitize } from '../src/js/state.js';
import { plural } from '../src/js/prompt/strings.js';

/** Stan domyslny z podmienionymi polami. */
const withState = (patch = {}) => sanitize({ ...defaultState(), ...patch });

test('domyslny stan daje kompletny, sensowny prompt', () => {
  const text = compile(defaultState());

  assert.match(text, /^# Rola\n/);
  assert.match(text, /# Zadanie/);
  assert.match(text, /# Format odpowiedzi/);
  assert.match(text, /# Zasady/);
  assert.match(text, /Gotuję dla 2 osób\./);
  assert.match(text, /Posiłki do zaplanowania: obiad\./);
});

test('nie przecieka zadne undefined/null/NaN', () => {
  const text = compile(
    withState({
      pantry: ['tomato', 'eggs'],
      moods: ['spicy'],
      nutrition: { enabled: true, kcal: '2200', protein: '140', goal: 'cut' },
      notes: 'w czwartek wracam późno',
    })
  );

  assert.doesNotMatch(text, /undefined|null|NaN|\[object Object\]/);
});

test('puste sekcje w ogole sie nie pojawiaja', () => {
  const text = compile(defaultState());

  // domyslnie nie ma diety, alergii, spizarni, makro ani uwag
  assert.doesNotMatch(text, /## Dieta i ograniczenia/);
  assert.doesNotMatch(text, /## Moja lodówka/);
  assert.doesNotMatch(text, /## Cele żywieniowe/);
  assert.doesNotMatch(text, /## Dodatkowe uwagi/);
  // ...a naglowki, ktore sa, nie wiszą puste
  assert.doesNotMatch(text, /#{1,3} [^\n]+\n(#|$)/);
});

test('nie ma potrojnych pustych linii', () => {
  const text = compile(
    withState({ pantry: ['tomato'], diets: ['vegan'], notes: 'cokolwiek', likes: 'czosnek' })
  );
  assert.doesNotMatch(text, /\n{3,}/);
});

test('spizarnia grupuje sie po kategoriach i zachowuje ich kolejnosc', () => {
  const text = compile(withState({ pantry: ['eggs', 'tomato', 'rice', 'onion'] }));

  assert.match(text, /- Warzywa: pomidory, cebula/);
  assert.match(text, /- Nabiał i jaja: jajka/);
  assert.match(text, /- Sypkie i pieczywo: ryż/);
  assert.ok(text.indexOf('Warzywa:') < text.indexOf('Nabiał'), 'kolejnosc kategorii z katalogu');
});

test('tryb „tylko z tego, co mam" dokłada twarda zasade', () => {
  const only = compile(withState({ pantry: ['eggs'], pantryMode: 'only' }));
  const prefer = compile(withState({ pantry: ['eggs'], pantryMode: 'prefer' }));

  assert.match(only, /użyj \*\*wyłącznie\*\* tych składników/);
  assert.match(prefer, /zbuduj dania głównie na tym/);
});

test('brak zgody na zakupy zeruje liste zakupow', () => {
  const text = compile(withState({ shopping: { allowed: false, maxItems: '8', budget: '150 zł' } }));
  assert.match(text, /Nie idę na zakupy/);
  assert.doesNotMatch(text, /Mogę dokupić maksymalnie/);
});

test('limit skladnikow odmienia sie poprawnie', () => {
  const one = compile(withState({ shopping: { allowed: true, maxItems: '1', budget: '' } }));
  const few = compile(withState({ shopping: { allowed: true, maxItems: '3', budget: '' } }));
  const many = compile(withState({ shopping: { allowed: true, maxItems: '12', budget: '' } }));

  assert.match(one, /maksymalnie 1 składnik\./);
  assert.match(few, /maksymalnie 3 składniki\./);
  assert.match(many, /maksymalnie 12 składników\./);
});

test('zasady zalezą od ustawien', () => {
  const short = compile(withState({ scope: 'now', time: 'any', output: { parts: ['recipes'] } }));
  assert.doesNotMatch(short, /Nie powtarzaj tego samego dania/);
  assert.doesNotMatch(short, /Trzymaj się limitu czasu/);
  assert.doesNotMatch(short, /Podawaj konkretne ilości/);

  const long = compile(withState({ scope: 'week', days: 7, time: '30' }));
  assert.match(long, /Nie powtarzaj tego samego dania/);
  assert.match(long, /Trzymaj się limitu czasu/);
  assert.match(long, /Podawaj konkretne ilości/);
});

test('dopytanie i „bez lania wody" sa opcjonalne', () => {
  const plain = compile(withState({ output: { askFirst: false, noFluff: false } }));
  assert.doesNotMatch(plain, /zadaj mi maksymalnie 3 pytania/);
  assert.doesNotMatch(plain, /Bez wstępów/);

  const chatty = compile(withState({ output: { askFirst: true, noFluff: true } }));
  assert.match(chatty, /zadaj mi maksymalnie 3 pytania/);
  assert.match(chatty, /Bez wstępów/);
});

test('tryb ADHD dokłada osobną sekcję o sposobie pisania przepisu', () => {
  const off = compile(defaultState());
  assert.doesNotMatch(off, /Jak mam to dostać/);

  const on = compile(withState({ output: { focus: true } }));
  assert.match(on, /# Jak mam to dostać/);
  assert.match(on, /\*\*dokładnie jedno\*\* danie/);
  assert.match(on, /Jeden numerowany krok = jedna czynność/);
  assert.match(on, /ile minut mam wolne/);

  // Ma stać między formatem a zasadami — najpierw „co", potem „jak", na końcu „czego nie".
  assert.ok(on.indexOf('# Format odpowiedzi') < on.indexOf('# Jak mam to dostać'));
  assert.ok(on.indexOf('# Jak mam to dostać') < on.indexOf('# Zasady'));
});

test('tryb ADHD po angielsku też działa', () => {
  const text = compile(withState({ lang: 'en', output: { focus: true } }));
  assert.match(text, /# How I need this written/);
  assert.match(text, /\*\*exactly one\*\* dish/);
  assert.doesNotMatch(text, /Jak mam to dostać/);
});

test('angielski prompt jest naprawde angielski', () => {
  const text = compile(withState({ lang: 'en', pantry: ['tomato'], diets: ['vegan'] }));

  assert.match(text, /^# Role\n/);
  assert.match(text, /# Task/);
  assert.match(text, /My fridge and pantry/);
  assert.match(text, /Vegetables: tomatoes/);
  assert.doesNotMatch(text, /Zasady|Gotuję|Posiłki/);
});

test('zakres planu zmienia zdanie otwierajace', () => {
  assert.match(compile(withState({ scope: 'now' })), /Zaproponuj jedzenie na teraz/);
  assert.match(compile(withState({ scope: 'day' })), /na cały dzień/);
  assert.match(compile(withState({ scope: 'days', days: 3 })), /na 3 dni/);
  assert.match(compile(withState({ scope: 'week' })), /na cały tydzień/);
});

test('alergeny z listy i wpisane recznie laczą sie w jedno zdanie', () => {
  const text = compile(withState({ allergens: ['nuts'], allergensExtra: 'kolendra, oliwki' }));
  assert.match(text, /Alergie i rzeczy zakazane: orzechy, kolendra i oliwki/);
});

test('data jest wstrzykiwana, a nie brana z zegara', () => {
  const a = compile(defaultState(), { date: '2026-01-01' });
  const b = compile(defaultState(), { date: '2026-01-01' });
  assert.equal(a, b);
  assert.match(a, /<!-- Wygenerowane w stdmeal · 2026-01-01 -->$/);
  assert.doesNotMatch(compile(defaultState()), /<!--/);
});

test('kompilacja jest czysta — nie rusza stanu wejsciowego', () => {
  const state = withState({ pantry: ['tomato'] });
  const snapshot = JSON.stringify(state);
  compile(state);
  assert.equal(JSON.stringify(state), snapshot);
});

test('statystyki sa policzone i dodatnie', () => {
  const info = stats(compile(defaultState()));
  assert.ok(info.chars > 200);
  assert.ok(info.words > 40);
  assert.ok(info.tokens > 50);
  assert.ok(estimateTokens('abc', 'en') >= 1);
});

test('polska odmiana przez liczebniki', () => {
  const form = (n) => plural(n, 'dzień', 'dni', 'dni');
  assert.equal(form(1), 'dzień');
  assert.equal(form(2), 'dni');
  assert.equal(form(5), 'dni');

  const item = (n) => plural(n, 'składnik', 'składniki', 'składników');
  assert.equal(item(1), 'składnik');
  assert.equal(item(2), 'składniki');
  assert.equal(item(5), 'składników');
  assert.equal(item(12), 'składników', '12 to wyjatek: dwanaście składników');
  assert.equal(item(22), 'składniki', '22 wraca do formy „składniki"');
  assert.equal(item(112), 'składników');
});
