/**
 * Testy dostępności, które da się sprawdzić maszynowo.
 *
 * Nie zastąpią przejścia strony czytnikiem ekranu, ale łapią dokładnie te
 * rzeczy, które psują się po cichu przy kolejnej zmianie: kontrast po zmianie
 * odcienia w tokenach, kontrolka bez nazwy, obrazek bez opisu.
 *
 * Kontrast liczymy według WCAG 2.1 — wzór na luminancję względną jest
 * w specyfikacji i ma kilkanaście linii, więc nie ma powodu brać na to
 * zależności.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(resolve(ROOT, file), 'utf8');

const tokens = read('src/css/tokens.css');
const html = read('index.html');
const js = ['src/js/ui/controls.js', 'src/js/ui/pantry.js', 'src/js/main.js']
  .map(read)
  .join('\n');

// ——— kolory —————————————————————————————————————————————————

function parseHex(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  return [0, 2, 4].map((index) => Number.parseInt(full.slice(index, index + 2), 16));
}

/** Luminancja względna wg WCAG 2.1. */
function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Współczynnik kontrastu: od 1 (brak) do 21 (czarne na białym). */
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Wyciąga zestaw zmiennych z jednego bloku tokens.css.
 * `:root {` to motyw jasny, `:root[data-theme="dark"] {` to ciemny.
 */
function palette(selector) {
  const start = tokens.indexOf(selector);
  assert.notEqual(start, -1, `nie znalazłem bloku ${selector}`);
  const block = tokens.slice(start, tokens.indexOf('\n}', start));

  const colors = {};
  for (const [, name, value] of block.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{3,6});/g)) {
    colors[name] = value;
  }
  return colors;
}

const LIGHT = palette(':root {');
const DARK = palette(':root[data-theme="dark"] {');

/**
 * Pary, które muszą spełniać próg 4.5:1 — wszystkie są tekstem,
 * a większość jest mała (podpowiedzi, statystyki, nazwy kategorii).
 */
const TEXT_PAIRS = [
  ['--fg', '--bg', 'tekst główny na tle strony'],
  ['--fg', '--surface', 'tekst główny na karcie'],
  ['--fg-muted', '--bg', 'tekst drugorzędny na tle strony'],
  ['--fg-muted', '--surface', 'tekst drugorzędny na karcie'],
  ['--fg-dim', '--bg', 'podpowiedzi na tle strony'],
  ['--fg-dim', '--surface', 'podpowiedzi na karcie'],
  ['--bg', '--fg', 'zaznaczony chip (inwersja)'],
  ['--warn', '--accent-soft', 'ostrzeżenie w ramce'],
  ['--warn-on', '--warn-solid', 'tekst na powiadomieniu ostrzegawczym'],
];

/** Elementy nietekstowe: granice i kontrolki — próg 3:1 wg WCAG 1.4.11. */
const UI_PAIRS = [
  ['--line-strong', '--bg', 'obramowanie kontrolek'],
  ['--fg-dim', '--surface-2', 'kółko wyłączonego przełącznika'],
];

for (const [name, colors] of [
  ['jasny', LIGHT],
  ['ciemny', DARK],
]) {
  test(`kontrast tekstu spełnia WCAG AA — motyw ${name}`, () => {
    for (const [fg, bg, what] of TEXT_PAIRS) {
      assert.ok(colors[fg], `brak ${fg} w motywie ${name}`);
      assert.ok(colors[bg], `brak ${bg} w motywie ${name}`);

      const ratio = contrast(colors[fg], colors[bg]);
      assert.ok(
        ratio >= 4.5,
        `${what} (${fg} na ${bg}, motyw ${name}): ${ratio.toFixed(2)}:1, a musi być ≥ 4.5:1`
      );
    }
  });

  test(`kontrast elementów interfejsu — motyw ${name}`, () => {
    for (const [fg, bg, what] of UI_PAIRS) {
      const ratio = contrast(colors[fg], colors[bg]);
      assert.ok(
        ratio >= 3,
        `${what} (${fg} na ${bg}, motyw ${name}): ${ratio.toFixed(2)}:1, a musi być ≥ 3:1`
      );
    }
  });
}

test('oba motywy definiują ten sam zestaw kolorów', () => {
  const lightColors = Object.keys(LIGHT).filter((name) => /fg|bg|line|surface|accent|warn/.test(name));
  const darkColors = Object.keys(DARK);

  for (const name of lightColors) {
    assert.ok(darkColors.includes(name), `ciemny motyw nie nadpisuje ${name}`);
  }
});

// ——— nazwy kontrolek ————————————————————————————————————————

test('każdy przycisk ikonowy w HTML-u ma nazwę', () => {
  // Przycisk z samą ikoną nie ma tekstu, więc bez aria-label czytnik
  // przeczyta „przycisk" i tyle.
  const buttons = html.match(/<(button|a)[^>]*class="iconbtn[^"]*"[^>]*>/g) ?? [];
  assert.ok(buttons.length >= 6, 'spodziewam się kilku przycisków ikonowych');

  for (const button of buttons) {
    assert.match(button, /aria-label="[^"]+"/, `przycisk bez nazwy: ${button.slice(0, 80)}`);
  }
});

test('kontrolki budowane w JS mają nazwy', () => {
  // Grupy chipów i segmentów wskazują na swoją etykietę zamiast powtarzać tekst.
  assert.match(js, /role: 'radiogroup',\s*'aria-labelledby'/);
  assert.match(js, /role: 'group',\s*'aria-labelledby'/);

  // Pola tekstowe mają prawdziwy <label for>.
  assert.match(js, /labelFor: id/);
  assert.match(js, /h\('label\.field__label'/);

  // Przyciski licznika mówią, czego dotyczą.
  assert.match(js, /`mniej: \$\{what\}`/);
  assert.match(js, /`więcej: \$\{what\}`/);
});

test('segmenty obsługują klawiaturę wzorcem radiogroup', () => {
  assert.match(js, /ArrowRight/, 'brak obsługi strzałek');
  assert.match(js, /tabindex.*-1|tabindex': '-1'/, 'brak roving tabindex');
  assert.match(js, /setAttribute\('tabindex', active \? '0' : '-1'\)/);
});

test('strona ma język, punkt pominięcia nawigacji i sensowne nagłówki', () => {
  assert.match(html, /<html lang="pl">/);
  assert.match(html, /class="skip"/);
  assert.equal((html.match(/<h1/g) ?? []).length, 1, 'dokładnie jeden <h1>');
  assert.match(html, /<dialog[^>]+aria-labelledby="help-title"/);
});

test('logo i ikony dekoracyjne są opisane albo ukryte', () => {
  assert.match(html, /<svg class="brand__logo"[^>]*role="img"[^>]*aria-label="[^"]+"/s);
  // Ikony ze sprite'a są dekoracyjne — treść niosą etykiety obok.
  assert.match(read('src/js/icons.js'), /aria-hidden="true"/);
});

test('animacje da się wyłączyć', () => {
  assert.match(read('src/css/base.css'), /@media \(prefers-reduced-motion: reduce\)/);
});
