/**
 * Testy spojnosci danych — najtansze ubezpieczenie w tym projekcie.
 *
 * Katalog produktow, slowniki opcji, schemat formularza i presety to cztery
 * osobne pliki, ktore musza sie zgadzac co do id-kow. Literowka w `icon` albo
 * w sciezce pola nie wywali aplikacji — po prostu cos cicho przestanie dzialac.
 * Te testy zamieniaja „cicho" na „czerwono".
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { CATEGORIES, PANTRY, groupPantry, normalize, searchPantry } from '../src/js/data/pantry.js';
import * as OPTIONS_PANTRY from '../src/js/data/pantry.js';
import * as OPTIONS from '../src/js/data/options.js';
import { PRESETS } from '../src/js/data/presets.js';
import { FOOD, UI } from '../src/js/icons.js';
import { ALL_FIELDS, SECTIONS } from '../src/js/schema.js';
import { DEFAULTS, deepMerge, defaultState, getPath, sanitize } from '../src/js/state.js';

/** Wszystkie eksportowane slowniki opcji (tablice obiektow z `id`). */
const DICTS = Object.entries(OPTIONS).filter(
  ([, value]) => Array.isArray(value) && value.every((item) => item && typeof item.id === 'string')
);

test('katalog spizarni: unikalne id', () => {
  const ids = PANTRY.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, 'zduplikowane id w PANTRY');
});

test('katalog spizarni: kazdy produkt ma istniejaca ikone i kategorie', () => {
  const categories = new Set(CATEGORIES.map((category) => category.id));
  for (const item of PANTRY) {
    assert.ok(FOOD[item.icon], `produkt "${item.id}" wskazuje na nieistniejącą ikonę "${item.icon}"`);
    assert.ok(categories.has(item.cat), `produkt "${item.id}" ma nieznaną kategorię "${item.cat}"`);
    assert.ok(item.pl?.length > 1, `produkt "${item.id}" bez nazwy PL`);
    assert.ok(item.en?.length > 1, `produkt "${item.id}" bez nazwy EN`);
  }
});

test('kazda kategoria ma przynajmniej jeden produkt', () => {
  for (const category of CATEGORIES) {
    const count = PANTRY.filter((item) => item.cat === category.id).length;
    assert.ok(count > 0, `kategoria "${category.id}" jest pusta`);
  }
});

test('slowniki opcji: unikalne id, komplet tlumaczen, istniejace ikony', () => {
  assert.ok(DICTS.length >= 10, 'spodziewam sie kilkunastu slownikow');

  for (const [name, list] of DICTS) {
    const ids = list.map((option) => option.id);
    assert.equal(new Set(ids).size, ids.length, `zduplikowane id w ${name}`);

    for (const option of list) {
      assert.ok(option.pl?.length > 0, `${name}.${option.id} bez nazwy PL`);
      assert.ok(option.en?.length > 0, `${name}.${option.id} bez nazwy EN`);
      if (option.icon) {
        assert.ok(FOOD[option.icon], `${name}.${option.id} wskazuje na nieistniejącą ikonę "${option.icon}"`);
      }
    }
  }
});

test('ikony: poprawny markup i rozsadna liczba', () => {
  assert.ok(Object.keys(FOOD).length >= 50, 'zestaw ikon jedzenia wyglada na okrojony');
  for (const [id, markup] of Object.entries({ ...FOOD, ...UI })) {
    assert.match(markup, /^<(path|circle|rect|ellipse|g|polygon)/, `ikona "${id}" ma dziwny markup`);
    assert.ok(!markup.includes('<script'), `ikona "${id}" zawiera <script>`);
  }
});

test('ikony UI sa monochromatyczne (dziedziczą kolor tekstu)', () => {
  for (const [id, markup] of Object.entries(UI)) {
    if (id === 'logo') continue; // logo celowo ma wlasne kolory
    assert.doesNotMatch(markup, /#[0-9a-f]{3,6}/i, `ikona UI "${id}" ma zapieczony kolor`);
  }
});

test('schemat: kazde pole celuje w istniejaca sciezke w stanie', () => {
  for (const field of ALL_FIELDS) {
    if (!field.path) continue; // np. "people", ktore obsluguje dwie sciezki naraz
    assert.notEqual(
      getPath(DEFAULTS, field.path),
      undefined,
      `pole "${field.path}" (sekcja ${field.section}) nie ma odpowiednika w DEFAULTS`
    );
  }
});

test('schemat: opcje pol przechodza przez sanityzacje', () => {
  for (const field of ALL_FIELDS) {
    if (!field.options || !field.path) continue;

    for (const option of field.options) {
      const isList = Array.isArray(getPath(DEFAULTS, field.path));
      const candidate = defaultState();
      const value = isList ? [option.id] : option.id;
      const parts = field.path.split('.');
      const last = parts.pop();
      const target = parts.reduce((acc, key) => acc[key], candidate);
      target[last] = value;

      const survived = getPath(sanitize(candidate), field.path);
      assert.deepEqual(
        survived,
        value,
        `opcja "${option.id}" pola "${field.path}" nie przeżywa sanitize() — brakuje wpisu w ENUMS?`
      );
    }
  }
});

test('schemat: numery sekcji sa unikalne i po kolei', () => {
  const nums = SECTIONS.map((section) => section.num);
  assert.deepEqual(
    nums,
    nums.map((_, index) => String(index + 1).padStart(2, '0')),
    'numery sekcji sie rozjechaly'
  );
});

test('presety: kazda wartosc z patcha faktycznie ląduje w stanie', () => {
  const walk = (patch, result, trail = []) => {
    for (const [key, value] of Object.entries(patch)) {
      const here = [...trail, key].join('.');
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        walk(value, result, [...trail, key]);
      } else {
        assert.deepEqual(
          getPath(result, here),
          value,
          `preset ustawia "${here}" na ${JSON.stringify(value)}, a sanitize to odrzuca`
        );
      }
    }
  };

  for (const preset of PRESETS) {
    assert.ok(preset.pl?.length > 0, `preset ${preset.id} bez nazwy`);
    assert.ok(FOOD[preset.icon], `preset ${preset.id} ma nieistniejącą ikonę`);
    const result = sanitize(deepMerge(defaultState(), preset.patch));
    walk(preset.patch, result);
  }
});

test('wyszukiwarka nie przejmuje sie ogonkami ani wielkoscia liter', () => {
  assert.ok(searchPantry('ZOLTY').some((item) => item.id === 'cheese'));
  assert.ok(searchPantry('maka').some((item) => item.id === 'flour'));
  assert.ok(searchPantry('łosoś').some((item) => item.id === 'salmon'));
  assert.ok(searchPantry('platki').some((item) => item.id === 'oats'));
  assert.equal(searchPantry('kalarepa').length, 0);
  assert.equal(searchPantry('').length, PANTRY.length);
  assert.equal(normalize('Żółć'), 'zolc');
});

test('groupPantry zwraca tylko niepuste grupy, w kolejnosci katalogu', () => {
  const groups = groupPantry(['rice', 'tomato', 'eggs']);
  assert.deepEqual(
    groups.map((group) => group.cat.id),
    ['veg', 'dairy', 'staples']
  );
  assert.deepEqual(groups[0].items, ['pomidory']);

  const english = groupPantry(['tomato'], 'en');
  assert.equal(english[0].label, 'Vegetables');
  assert.deepEqual(english[0].items, ['tomatoes']);

  assert.deepEqual(groupPantry(['nie-ma-takiego']), []);
});

test('zgadywanie produktu z nazwy działa i wybiera najdłuższe trafienie', () => {
  const { guessFromName, CATEGORY_ICONS, CATEGORY_ICON_CHOICES } = OPTIONS_PANTRY;

  assert.equal(guessFromName('ser kozi')?.id, 'cheese');
  assert.equal(guessFromName('mleko owsiane')?.id, 'milk');
  assert.equal(guessFromName('MAKARON pełnoziarnisty')?.id, 'pasta');
  assert.equal(guessFromName('łosoś wędzony')?.id, 'salmon');
  assert.equal(
    guessFromName('masło orzechowe')?.id,
    'peanutbutter',
    'dłuższe dopasowanie wygrywa z samym „masłem"'
  );
  assert.equal(guessFromName('kombucha'), null, 'nieznane zostaje nieznane');
  assert.equal(guessFromName('ab'), null, 'za krótkie, żeby zgadywać');
});

test('ikony kategorii i listy do wyboru wskazują na istniejące ikony', () => {
  const { CATEGORY_ICONS, CATEGORY_ICON_CHOICES } = OPTIONS_PANTRY;

  for (const category of CATEGORIES) {
    assert.ok(FOOD[CATEGORY_ICONS[category.id]], `kategoria ${category.id} bez ikony zastępczej`);

    const choices = CATEGORY_ICON_CHOICES[category.id];
    assert.ok(Array.isArray(choices) && choices.length >= 4, `za mało ikon do wyboru w ${category.id}`);
    for (const icon of choices) {
      assert.ok(FOOD[icon], `ikona "${icon}" z listy ${category.id} nie istnieje`);
    }
    assert.ok(
      choices.includes(CATEGORY_ICONS[category.id]),
      `ikona zastępcza ${category.id} powinna być na liście do przewijania`
    );
  }
});
