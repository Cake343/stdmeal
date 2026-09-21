/**
 * Testy zapisu stanu: localStorage, link do udostepniania, import/eksport.
 * Node ma btoa/atob i TextEncoder, wiec caly ten kod da sie przetestowac
 * bez przegladarki — funkcje dotykajace `window` przyjmuja location jako argument.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeState,
  diffFromDefaults,
  encodeState,
  fromJsonFile,
  shareUrl,
  toJsonFile,
} from '../src/js/persist.js';
import { defaultState, sanitize } from '../src/js/state.js';

const FAKE_LOCATION = {
  origin: 'https://kuchnia.oakloud.dev',
  pathname: '/stdmeal/',
  search: '',
  hash: '',
};

const sample = () =>
  sanitize({
    ...defaultState(),
    scope: 'week',
    days: 7,
    pantry: ['tomato', 'eggs', 'rice'],
    moods: ['spicy', 'comfort'],
    notes: 'w piątek goście, żarcie na 6 osób',
    people: { adults: 3, kids: 2 },
  });

test('stan domyslny nie generuje zadnej roznicy', () => {
  assert.deepEqual(diffFromDefaults(defaultState()), {});
});

test('roznica zawiera tylko to, co zmienione', () => {
  const diff = diffFromDefaults(sample());
  assert.deepEqual(Object.keys(diff).sort(), ['days', 'moods', 'notes', 'pantry', 'people', 'scope']);
  assert.deepEqual(diff.people, { adults: 3, kids: 2 });
  assert.equal(diff.output, undefined, 'nietkniete galezie nie trafiaja do roznicy');
});

test('kodowanie i dekodowanie zachowuje stan w calosci', () => {
  const state = sample();
  const restored = decodeState(encodeState(state));
  assert.deepEqual(restored, state);
});

test('link przezywa polskie znaki', () => {
  const state = sanitize({ ...defaultState(), notes: 'żółć, ćma i zażółcona gęś — 100 zł' });
  assert.equal(decodeState(encodeState(state)).notes, state.notes);
});

test('link jest krotki, bo koduje tylko roznice', () => {
  assert.ok(encodeState(defaultState()).length < 10, 'domyslny stan to prawie pusty link');
  assert.ok(encodeState(sample()).length < 400, 'realistyczny stan miesci sie w rozsadnym linku');
});

test('smieci w linku nie wywracaja aplikacji', () => {
  for (const junk of ['', '#', 'nie-base64!!!', '#s=////', 'undefined', '#s=eyJub3BlIjox']) {
    const result = decodeState(junk);
    assert.ok(result === null || typeof result === 'object');
  }
});

test('spreparowany link nie przemyci wartosci spoza slownikow', () => {
  const evil = encodeState(
    sanitize({
      ...defaultState(),
      pantry: ['tomato'],
    })
  );
  const decoded = decodeState(evil);
  assert.deepEqual(decoded.pantry, ['tomato']);

  // recznie sklecony ladunek, z pominieciem encodeState
  const payload = Buffer.from(JSON.stringify({ scope: 'rm -rf /', pantry: ['<script>'] }))
    .toString('base64url');
  const sanitized = decodeState(`#s=${payload}`);
  assert.equal(sanitized.scope, 'day', 'nieznany zakres wraca do domyslnego');
  assert.deepEqual(sanitized.pantry, [], 'nieznany produkt wylatuje');
});

test('prefiks #s= jest opcjonalny', () => {
  const encoded = encodeState(sample());
  assert.deepEqual(decodeState(`#s=${encoded}`), decodeState(encoded));
});

test('shareUrl sklada poprawny adres', () => {
  const url = shareUrl(sample(), FAKE_LOCATION);
  assert.match(url, /^https:\/\/kuchnia\.oakloud\.dev\/stdmeal\/#s=/);
  assert.deepEqual(decodeState(new URL(url).hash), sample());
});

test('eksport do JSON-a jest czytelny i wraca bez strat', () => {
  const state = sample();
  const file = toJsonFile(state);

  assert.match(file, /^\{\n {2}"app": "stdmeal",/);
  assert.ok(file.endsWith('\n'));
  assert.deepEqual(fromJsonFile(file), state);
});

test('import cudzego pliku nie wywala aplikacji', () => {
  assert.equal(fromJsonFile('to nie jest JSON'), null);
  assert.equal(fromJsonFile(''), null);
  assert.deepEqual(fromJsonFile('{"app":"coś innego"}'), defaultState());
});
