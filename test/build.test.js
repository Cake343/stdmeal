/**
 * Test buildu — pilnuje obietnicy „jeden plik, dwuklik i dziala".
 *
 * Bundler jest wlasny, wiec musi miec test, ktory naprawde go uruchamia,
 * sprawdza wynik i parsuje wygenerowany JavaScript. `new Function(kod)`
 * kompiluje kod bez wykonywania go — czyli lapie bledy skladni, a nie probuje
 * dobrac sie do `document` w Node.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('build produkuje jeden samowystarczalny plik', () => {
  execFileSync(process.execPath, ['tools/build.mjs'], { cwd: ROOT, stdio: 'pipe' });

  const html = readFileSync(resolve(ROOT, 'dist/index.html'), 'utf8');

  assert.match(html, /<style>/, 'CSS nie zostal wstawiony');
  assert.doesNotMatch(html, /<link rel="stylesheet"/, 'zostal zewnetrzny arkusz stylow');
  assert.doesNotMatch(html, /(?:href|src)="(?:\.\/)?src\//, 'zostal odnośnik do pliku ze zrodel');
  assert.doesNotMatch(html, /<script[^>]+src=/, 'zostal zewnetrzny skrypt');

  // sprite z ikonami i tresci, ktore musza przetrwac sklejanie
  assert.match(html, /stdmeal/);
  // Sprite powstaje w locie z FOOD, wiec w pliku szukamy definicji ikony,
  // a nie gotowego <symbol> (ten istnieje dopiero po uruchomieniu skryptu).
  assert.match(html, /tomato: '<circle/, 'katalog ikon nie wszedl do wyniku');
  assert.match(html, /spriteMarkup/, 'brakuje generatora sprite');

  const size = Buffer.byteLength(html, 'utf8') / 1024;
  assert.ok(size > 80, `wynik podejrzanie maly: ${size.toFixed(1)} kB`);
  assert.ok(size < 500, `wynik podejrzanie duzy: ${size.toFixed(1)} kB`);
});

test('wygenerowany javascript sie parsuje', () => {
  const html = readFileSync(resolve(ROOT, 'dist/index.html'), 'utf8');
  const match = html.match(/<script>\n([\s\S]*?)\n\s*<\/script>/);

  assert.ok(match, 'nie znalazlem wstawionego skryptu');
  assert.doesNotThrow(() => new Function(match[1]), 'zbudowany kod ma blad skladni');
  assert.ok(match[1].includes('__require("src/js/main.js")'), 'brakuje wywolania wejsciowego');
});

test('build zachowuje wszystkie moduly zrodlowe', () => {
  const html = readFileSync(resolve(ROOT, 'dist/index.html'), 'utf8');
  for (const module of [
    'src/js/main.js',
    'src/js/state.js',
    'src/js/persist.js',
    'src/js/schema.js',
    'src/js/icons.js',
    'src/js/prompt/compile.js',
    'src/js/prompt/strings.js',
    'src/js/data/pantry.js',
    'src/js/data/options.js',
    'src/js/data/presets.js',
    'src/js/ui/controls.js',
    'src/js/ui/pantry.js',
    'src/js/ui/chrome.js',
    'src/js/ui/dom.js',
  ]) {
    assert.ok(html.includes(`"${module}"`), `w wyniku brakuje modulu ${module}`);
  }
});
