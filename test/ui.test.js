/**
 * Test dymny calej aplikacji: startuje main.js na atrapie DOM-u i sprawdza,
 * ze najwazniejsza petla dziala — klik w chip zmienia tekst promptu.
 *
 * To nie zastepuje ogladania strony w przegladarce (styl, ustawienie rzeczy,
 * kolory), ale odpowiada na pytanie „czy to w ogole wstaje i reaguje",
 * ktore inaczej trzeba by sprawdzac recznie po kazdej zmianie.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { installDom } from './helpers/mini-dom.js';
import { PANTRY } from '../src/js/data/pantry.js';
import { PRESETS } from '../src/js/data/presets.js';
import { SECTIONS } from '../src/js/schema.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

// Atrapa musi stac, zanim main.js sie wykona (to modul z efektami ubocznymi).
const { document, localStorage } = installDom(html);
await import('../src/js/main.js');

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const prompt = () => $('#prompt').value;
const chip = (id) => $$('.chip').find((node) => node.dataset.id === id);

test('aplikacja wstaje i renderuje wszystkie sekcje', () => {
  assert.equal($('#form').children.length, SECTIONS.length);
  assert.equal($('#presets').children.length, PRESETS.length);
  assert.ok($$('.section').length >= SECTIONS.length);
});

test('spizarnia ma komplet produktow z katalogu', () => {
  assert.equal($$('.chip--pantry').length, PANTRY.length);
  assert.ok($('.pantry__search'), 'brakuje wyszukiwarki');
});

test('prompt jest generowany od razu po starcie', () => {
  assert.match(prompt(), /^# Rola/);
  assert.match(prompt(), /# Zadanie/);
  assert.match($('#stats').textContent, /znaków · \d+ słów · ~\d+ tokenów/);
});

test('klikniecie produktu w lodowce przebudowuje prompt', () => {
  assert.doesNotMatch(prompt(), /pomidory/);

  chip('tomato').click();

  assert.match(prompt(), /## Moja lodówka i spiżarnia/);
  assert.match(prompt(), /Warzywa: pomidory/);
  assert.equal(chip('tomato').getAttribute('aria-pressed'), 'true');
  assert.ok(chip('tomato').classList.contains('is-on'));
});

test('drugie klikniecie odznacza i sekcja znika', () => {
  chip('tomato').click();
  assert.doesNotMatch(prompt(), /## Moja lodówka/);
  assert.equal(chip('tomato').getAttribute('aria-pressed'), 'false');
});

test('wyszukiwarka filtruje chipy, nie kasujac zaznaczen', () => {
  chip('tomato').click();
  const search = $('.pantry__search');
  search.value = 'ser';
  search.dispatch('input');

  assert.ok(chip('cheese').hidden === false, 'ser żółty powinien zostać');
  assert.ok(chip('banana').hidden === true, 'banany powinny zniknąć');
  assert.equal(chip('tomato').getAttribute('aria-pressed'), 'true', 'zaznaczenie przetrwało filtr');

  search.value = '';
  search.dispatch('input');
  assert.equal(chip('banana').hidden, false);
  chip('tomato').click();
});

test('pola warunkowe pokazuja sie i chowaja', () => {
  const daysField = $$('.field').find((node) => node.dataset.path === 'days');
  assert.ok(daysField.hidden, 'przy zakresie „cały dzień" liczba dni jest zbędna');

  const scopeButton = $$('.seg__item').find((node) => node.dataset.id === 'days');
  scopeButton.click();

  assert.equal(daysField.hidden, false);
  assert.match(prompt(), /Ułóż plan jedzenia na 3 dni\./);
});

test('licznik dni dziala', () => {
  const daysField = $$('.field').find((node) => node.dataset.path === 'days');
  const [minus, plus] = daysField.querySelectorAll('.stepper__btn');

  plus.click();
  plus.click();
  assert.match(prompt(), /na 5 dni\./);

  minus.click();
  assert.match(prompt(), /na 4 dni\./);
});

test('preset ustawia kilka rzeczy naraz', () => {
  const weekPreset = $('#presets').children[PRESETS.findIndex((p) => p.id === 'week')];
  weekPreset.click();

  assert.match(prompt(), /na cały tydzień/);
  assert.match(prompt(), /Posiłki do zaplanowania: obiad i kolacja\./);
  assert.match(prompt(), /co da się przygotować wcześniej/);
});

test('przelacznik zmienia stan i tresc promptu', () => {
  const askFirst = $$('.switch').find(
    (node) => node.parent?.dataset?.path === 'output.askFirst'
  );
  assert.ok(askFirst, 'nie znalazłem przełącznika dopytywania');

  askFirst.click();
  assert.match(prompt(), /zadaj mi maksymalnie 3 pytania/);
  assert.equal(askFirst.getAttribute('aria-checked'), 'true');

  askFirst.click();
  assert.doesNotMatch(prompt(), /zadaj mi maksymalnie 3 pytania/);
});

test('jezyk promptu przelacza sie na angielski i z powrotem', () => {
  const [, en] = $$('.field')
    .find((node) => node.dataset.path === 'lang')
    .querySelectorAll('.seg__item');

  en.click();
  assert.match(prompt(), /^# Role/);

  const [pl] = $$('.field')
    .find((node) => node.dataset.path === 'lang')
    .querySelectorAll('.seg__item');
  pl.click();
  assert.match(prompt(), /^# Rola/);
});

test('motyw przelacza sie po kolei: auto → jasny → ciemny', () => {
  const button = $('#btn-theme');
  assert.equal(document.documentElement.getAttribute('data-theme'), null, 'na starcie systemowy');

  button.click();
  assert.equal(document.documentElement.getAttribute('data-theme'), 'light');

  button.click();
  assert.equal(document.documentElement.getAttribute('data-theme'), 'dark');

  button.click();
  assert.equal(document.documentElement.getAttribute('data-theme'), null);
});

test('okno ze skrotami otwiera sie i zamyka', () => {
  $('#btn-help').click();
  assert.equal($('#help').open, true);

  $('#help-close').click();
  assert.equal($('#help').open, false);

  document.dispatch('keydown', { key: '?', ctrlKey: false });
  assert.equal($('#help').open, true);
  document.dispatch('keydown', { key: '?', ctrlKey: false });
  assert.equal($('#help').open, false);
});

test('reset wymaga dwoch klikniec', () => {
  chip('eggs').click();
  assert.match(prompt(), /jajka/);

  $('#btn-reset').click();
  assert.match(prompt(), /jajka/, 'pierwszy klik tylko uzbraja');

  $('#btn-reset').click();
  assert.doesNotMatch(prompt(), /jajka/);
  assert.match(prompt(), /na cały dzień/, 'wrocilismy do ustawien domyslnych');
});

test('ustawienia trafiaja do localStorage', async () => {
  chip('rice').click();
  await new Promise((resolve) => setTimeout(resolve, 500)); // zapis jest opozniony

  const saved = JSON.parse(localStorage.getItem('stdmeal.state.v1'));
  assert.deepEqual(saved.pantry, ['rice']);
  assert.equal(saved.scope, undefined, 'zapisujemy tylko roznice wzgledem domyslnych');
});
