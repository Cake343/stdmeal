/**
 * Testy stanu i sanityzacji. Sanityzacja jest tu granica bezpieczenstwa:
 * do store'a wchodza dane z localStorage i z #hash w adresie, czyli z miejsc,
 * ktore uzytkownik (albo ktos, kto podeslal mu link) kontroluje w pelni.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULTS,
  createStore,
  deepMerge,
  defaultState,
  getPath,
  isPristine,
  sanitize,
  setPath,
} from '../src/js/state.js';

test('sciezki: odczyt i zapis', () => {
  const state = defaultState();
  assert.equal(getPath(state, 'people.adults'), 2);

  setPath(state, 'people.adults', 4);
  setPath(state, 'output.length', 'short');
  assert.equal(state.people.adults, 4);
  assert.equal(state.output.length, 'short');

  assert.equal(getPath(state, 'nie.ma.takiej.sciezki'), undefined);
});

test('sanitize odrzuca nieznane klucze', () => {
  const dirty = sanitize({ ...defaultState(), zlosliwePole: '<script>alert(1)</script>' });
  assert.equal(dirty.zlosliwePole, undefined);
});

test('sanitize przepuszcza tylko id ze slownikow', () => {
  const state = sanitize({
    meals: ['dinner', 'obiadek', 'supper'],
    pantry: ['tomato', '../../etc/passwd'],
    diets: ['vegan', 'DROP TABLE'],
    scope: 'kiedykolwiek',
  });

  assert.deepEqual(state.meals, ['dinner', 'supper']);
  assert.deepEqual(state.pantry, ['tomato']);
  assert.deepEqual(state.diets, ['vegan']);
  assert.equal(state.scope, DEFAULTS.scope, 'nieznana wartosc wraca do domyslnej');
});

test('sanitize usuwa duplikaty z list', () => {
  const state = sanitize({ pantry: ['eggs', 'eggs', 'rice'] });
  assert.deepEqual(state.pantry, ['eggs', 'rice']);
});

test('sanitize pilnuje typow i zakresow liczb', () => {
  assert.equal(sanitize({ days: '9' }).days, 9, 'liczba w stringu jest ratowana');
  assert.equal(sanitize({ days: 999 }).days, 14, 'gorny limit');
  assert.equal(sanitize({ days: -5 }).days, 1, 'dolny limit');
  assert.equal(sanitize({ days: 'dużo' }).days, DEFAULTS.days, 'smiec wraca do domyslnej');
  assert.equal(sanitize({ people: { adults: 3.7 } }).people.adults, 4, 'zaokraglenie');
  assert.equal(
    sanitize({ shopping: { allowed: 'tak' } }).shopping.allowed,
    DEFAULTS.shopping.allowed,
    'string zamiast boola wraca do domyslnej'
  );
});

test('sanitize przycina dlugie teksty', () => {
  const state = sanitize({ notes: 'a'.repeat(5000) });
  assert.equal(state.notes.length, 600);
});

test('sanitize uzupelnia brakujace pola domyslnymi', () => {
  const state = sanitize({ pantry: ['eggs'] });
  assert.deepEqual(state.meals, DEFAULTS.meals);
  assert.equal(state.output.length, DEFAULTS.output.length);
  assert.equal(state.v, DEFAULTS.v);
});

test('sanitize radzi sobie z kompletnymi smieciami', () => {
  for (const input of [null, undefined, 42, 'tekst', [], { people: 'nie' }]) {
    const state = sanitize(input);
    assert.equal(typeof state.people.adults, 'number');
    assert.ok(Array.isArray(state.pantry));
  }
});

test('store: set, toggle, patch, replace, reset', () => {
  const store = createStore();

  store.set('people.adults', 5);
  assert.equal(store.getPath('people.adults'), 5);

  store.toggle('pantry', 'eggs');
  store.toggle('pantry', 'rice');
  store.toggle('pantry', 'eggs');
  assert.deepEqual(store.getPath('pantry'), ['rice'], 'drugie klikniecie odznacza');

  store.patch({ scope: 'week', output: { length: 'short' } });
  assert.equal(store.getPath('scope'), 'week');
  assert.equal(store.getPath('output.length'), 'short');
  assert.deepEqual(store.getPath('pantry'), ['rice'], 'patch nie kasuje reszty stanu');

  store.replace({ scope: 'now' });
  assert.equal(store.getPath('scope'), 'now');
  assert.deepEqual(store.getPath('pantry'), [], 'replace czysci wszystko poza podanym');

  store.reset();
  assert.ok(isPristine(store.get()));
});

test('store powiadamia subskrybentow i pozwala sie odpiac', () => {
  const store = createStore();
  const seen = [];
  const off = store.subscribe((state, meta) => seen.push(meta?.path ?? 'inne'));

  store.set('days', 4);
  store.toggle('moods', 'spicy');
  off();
  store.set('days', 5);

  assert.deepEqual(seen, ['days', 'moods']);
});

test('stan jest zamrozony — nie da sie go po cichu zmutowac', () => {
  const store = createStore();
  const snapshot = store.get();

  assert.throws(() => {
    snapshot.people.adults = 99;
  }, TypeError);
  assert.throws(() => {
    snapshot.pantry.push('eggs');
  }, TypeError);

  store.set('days', 3);
  assert.equal(store.getPath('people.adults'), 2);
});

test('deepMerge: obiekty scala, tablice nadpisuje', () => {
  const base = { a: { x: 1, y: 2 }, list: [1, 2, 3] };
  const merged = deepMerge(base, { a: { y: 9 }, list: [7] });
  assert.deepEqual(merged, { a: { x: 1, y: 9 }, list: [7] });
});

test('isPristine rozroznia stan czysty od dotknietego', () => {
  const store = createStore();
  assert.ok(isPristine(store.get()));
  store.toggle('pantry', 'eggs');
  assert.ok(!isPristine(store.get()));
});
