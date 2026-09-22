/**
 * Testy PWA.
 *
 * Instalowalność aplikacji to zestaw cichych warunków: manifest musi być
 * poprawnym JSON-em, ikony muszą mieć dokładnie te wymiary, które deklarują,
 * service worker musi się sparsować, a build musi te pliki naprawdę wydać.
 * Żaden z tych warunków nie daje o sobie znać inaczej niż brakiem przycisku
 * „zainstaluj" — czyli objawem, którego nie widać, dopóki się go nie szuka.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(resolve(ROOT, file), 'utf8');

const manifest = JSON.parse(read('manifest.webmanifest'));
const html = read('index.html');

/** Czyta nagłówek PNG: sygnatura + wymiary z IHDR. */
function pngInfo(file) {
  const buffer = readFileSync(resolve(ROOT, file));
  return {
    signature: buffer.subarray(0, 8).toString('hex'),
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer[24],
    colorType: buffer[25],
    bytes: buffer.length,
  };
}

test('manifest ma wszystko, czego wymaga instalacja', () => {
  assert.equal(manifest.name.length > 0, true);
  assert.ok(manifest.short_name.length <= 12, 'short_name musi być krótki, inaczej zostanie ucięty');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './', 'ścieżki względne — aplikacja działa też w podkatalogu (Pages)');
  assert.match(manifest.background_color, /^#[0-9a-f]{6}$/i);
  assert.match(manifest.theme_color, /^#[0-9a-f]{6}$/i);
  assert.equal(manifest.lang, 'pl');
});

test('manifest ma komplet ikon: 192, 512 i maskowalną', () => {
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes('192x192'), 'brak ikony 192 — bez niej Chrome nie zaproponuje instalacji');
  assert.ok(sizes.includes('512x512'), 'brak ikony 512 — potrzebna na ekran powitalny');

  const maskable = manifest.icons.filter((icon) => icon.purpose === 'maskable');
  assert.equal(maskable.length, 1, 'potrzebna dokładnie jedna ikona maskowalna');
});

test('każda ikona z manifestu istnieje i ma zadeklarowane wymiary', () => {
  for (const icon of manifest.icons) {
    assert.ok(existsSync(resolve(ROOT, icon.src)), `brak pliku ${icon.src} — uruchom npm run icons`);

    const info = pngInfo(icon.src);
    const [width, height] = icon.sizes.split('x').map(Number);

    assert.equal(info.signature, '89504e470d0a1a0a', `${icon.src} nie jest plikiem PNG`);
    assert.equal(info.width, width, `${icon.src} ma inną szerokość niż deklaruje manifest`);
    assert.equal(info.height, height, `${icon.src} ma inną wysokość niż deklaruje manifest`);
    assert.equal(info.colorType, 6, `${icon.src} powinien być RGBA`);
    assert.equal(info.bitDepth, 8);
    assert.ok(info.bytes > 500, `${icon.src} jest podejrzanie mały — pusty obrazek?`);
  }
});

test('ikona dla iOS istnieje i jest pełnoekranowa', () => {
  const info = pngInfo('assets/pwa/apple-touch-icon.png');
  assert.equal(info.width, 180);
  assert.equal(info.height, 180);
  assert.match(html, /rel="apple-touch-icon" href="assets\/pwa\/apple-touch-icon\.png"/);
});

test('skróty z manifestu wskazują na istniejące tryby', async () => {
  const { PRESETS_BY_ID } = await import('../src/js/data/presets.js');

  assert.ok(manifest.shortcuts.length >= 2);
  for (const shortcut of manifest.shortcuts) {
    const id = new URL(shortcut.url, 'https://example.com/app/').searchParams.get('tryb');
    assert.ok(PRESETS_BY_ID[id], `skrót „${shortcut.name}" wskazuje na nieistniejący tryb "${id}"`);
    assert.ok(shortcut.short_name.length <= 12);
  }
});

test('index.html podpina manifest', () => {
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest"/);
  assert.match(html, /name="theme-color"/);
  assert.match(html, /name="mobile-web-app-capable" content="yes"/);
});

test('service worker parsuje się i ma sensowną strategię', () => {
  const sw = read('sw.js');

  assert.doesNotThrow(() => new Function(sw), 'sw.js ma błąd składni');
  assert.match(sw, /__STDMEAL_VERSION__/, 'brak znacznika wersji podmienianego przez build');
  assert.match(sw, /addEventListener\('install'/);
  assert.match(sw, /addEventListener\('activate'/);
  assert.match(sw, /addEventListener\('fetch'/);
  assert.match(sw, /caches\.delete/, 'stare cache muszą być sprzątane przy aktywacji');
  assert.match(sw, /includes\('\/src\/'\)/, 'tryb deweloperski musi omijać cache');
});

test('build wydaje komplet plików PWA', () => {
  execFileSync(process.execPath, ['tools/build.mjs'], { cwd: ROOT, stdio: 'pipe' });

  for (const file of [
    'dist/index.html',
    'dist/sw.js',
    'dist/manifest.webmanifest',
    'dist/assets/pwa/icon-192.png',
    'dist/assets/pwa/icon-512.png',
    'dist/assets/pwa/icon-maskable-512.png',
    'dist/assets/pwa/apple-touch-icon.png',
  ]) {
    assert.ok(existsSync(resolve(ROOT, file)), `build nie wyprodukował ${file}`);
  }
});

test('build wstawia do service workera wersję zależną od treści', () => {
  const sw = read('dist/sw.js');
  const match = sw.match(/const VERSION = '([^']+)'/);

  assert.ok(match, 'nie znalazłem wersji w zbudowanym sw.js');
  assert.match(match[1], /^\d+\.\d+\.\d+-[0-9a-f]{8}$/, 'wersja to numer z package.json + skrót treści');
  assert.doesNotMatch(sw, /__STDMEAL_VERSION__/, 'znacznik został niepodmieniony');
});

test('zbudowana strona zostaje samowystarczalna', () => {
  // PWA dokłada pliki obok, ale sam index.html musi nadal działać z dwukliku.
  const built = read('dist/index.html');
  assert.doesNotMatch(built, /<script[^>]+src=/, 'żaden skrypt nie może być zewnętrzny');
  assert.doesNotMatch(built, /<link rel="stylesheet"/, 'żaden arkusz nie może być zewnętrzny');
});
