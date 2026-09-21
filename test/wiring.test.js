/**
 * Testy okablowania: czy HTML, JavaScript i CSS mowia o tych samych nazwach.
 *
 * To sa bledy, ktorych nie widac — `qs('#btn-copi')` zwraca null i przycisk
 * po prostu nie dziala, a literowka w nazwie klasy daje element bez stylu.
 * Zadnego wyjatku, zadnego ostrzezenia. Stad ten test.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { UI } from '../src/js/icons.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(resolve(ROOT, file), 'utf8');

const html = read('index.html');
const jsFiles = [
  'src/js/main.js',
  'src/js/ui/controls.js',
  'src/js/ui/pantry.js',
  'src/js/ui/chrome.js',
];
const js = jsFiles.map(read).join('\n');
const css = ['tokens', 'base', 'layout', 'components'].map((name) => read(`src/css/${name}.css`)).join('\n');

const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));

test('index.html nie ma zduplikowanych id', () => {
  const all = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(all).size, all.length);
});

test('kazdy qs("#...") z JS-a ma swoj element w HTML-u', () => {
  const used = [...js.matchAll(/qs\('#([^']+)'\)/g)].map((match) => match[1]);
  assert.ok(used.length >= 10, 'spodziewam sie kilkunastu odwolan');

  for (const id of used) {
    assert.ok(htmlIds.has(id), `main.js szuka #${id}, a index.html tego nie ma`);
  }
});

test('kazde data-icon w HTML-u wskazuje na istniejaca ikone UI', () => {
  const icons = [...html.matchAll(/data-icon="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(icons.length > 5);

  for (const icon of icons) {
    assert.ok(UI[icon], `index.html używa ikony "${icon}", której nie ma w icons.js`);
  }
});

test('kazda ikona uzyta w JS-ie istnieje', () => {
  for (const [, icon] of js.matchAll(/uiIcon\('([^']+)'\)/g)) {
    assert.ok(UI[icon], `uiIcon('${icon}') — nie ma takiej ikony`);
  }
});

test('index.html laduje istniejace pliki zrodlowe', () => {
  const assets = [
    ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/<script type="module" src="([^"]+)"/g)].map((match) => match[1]),
  ];

  assert.equal(assets.length, 5, '4 arkusze CSS + 1 skrypt');
  for (const asset of assets) {
    assert.doesNotThrow(() => read(asset), `index.html odwołuje się do nieistniejącego ${asset}`);
  }
});

test('kazda klasa uzyta w HTML-u i JS-ie ma regule w CSS', () => {
  const fromHtml = [...html.matchAll(/class="([^"$]+)"/g)].flatMap((match) => match[1].split(/\s+/));
  const fromTags = [...js.matchAll(/h\('([a-z]+[\w.-]*)'/g)].flatMap((match) =>
    match[1].split('.').slice(1)
  );
  const fromProps = [...js.matchAll(/class: '([^'$]+)'/g)].flatMap((match) => match[1].split(/\s+/));
  const fromToggles = [...js.matchAll(/classList\.(?:toggle|add|contains|remove)\('([^']+)'/g)].map(
    (match) => match[1]
  );

  // Czyste uchwyty strukturalne: istnieja po to, zeby dalo sie je znalezc
  // w drzewie (testy, querySelector) albo zeby zgrupowac dzieci. Nie maja
  // wlasnego wygladu i celowo nie maja reguly w CSS.
  const STRUCTURAL = new Set(['col--out', 'field', 'section__head', 'pantry', 'pantry__group']);

  const used = new Set(
    [...fromHtml, ...fromTags, ...fromProps, ...fromToggles].filter(
      (name) => name && !STRUCTURAL.has(name)
    )
  );
  assert.ok(used.size > 40, `spodziewam sie kilkudziesieciu klas, znalazlem ${used.size}`);

  const missing = [...used].filter(
    (name) => !new RegExp(`\\.${name.replace(/[-.]/g, '\\$&')}(?![\\w-])`).test(css)
  );

  assert.deepEqual(missing, [], `klasy bez żadnej reguły w CSS: ${missing.join(', ')}`);
});

test('CSS uzywa tylko zdefiniowanych zmiennych', () => {
  const defined = new Set([...css.matchAll(/^\s*(--[\w-]+):/gm)].map((match) => match[1]));
  const used = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1]));

  const missing = [...used].filter((name) => !defined.has(name));
  assert.deepEqual(missing, [], `użyte, ale niezdefiniowane zmienne: ${missing.join(', ')}`);
});

test('ciemny motyw nadpisuje dokladnie te same zmienne co jasny', () => {
  const block = (pattern) => {
    const match = css.match(pattern);
    return new Set([...(match?.[1] ?? '').matchAll(/(--[\w-]+):/g)].map((entry) => entry[1]));
  };

  const auto = block(/:root:not\(\[data-theme="light"\]\) \{([\s\S]*?)\n {2}\}/);
  const forced = block(/:root\[data-theme="dark"\] \{([\s\S]*?)\n\}/);

  assert.ok(auto.size > 8, 'nie znalazlem bloku ciemnego motywu z mediaquery');
  assert.deepEqual(
    [...auto].sort(),
    [...forced].sort(),
    'ciemny motyw z systemu i wymuszony recznie rozjechaly sie w zmiennych'
  );
});
