/**
 * Testy spójności design systemu.
 *
 * „Konsekwentne odstępy" brzmi jak coś, co można tylko ocenić okiem. Da się
 * jednak zapisać mechanicznie: KAŻDY odstęp między elementami pochodzi ze
 * skali, a nie z liczby wpisanej w locie. Ten test pilnuje właśnie tego —
 * i przy okazji tego, że kolory idą z tokenów, a wysokości kontrolek
 * z jednej wartości, więc rzędy mieszane (pole + lista + przycisk) są równe.
 *
 * Padding wewnątrz kontrolek celowo NIE jest tu wymuszany: to strojenie
 * optyczne (7px przy chipie, 9px przy polu), które ma dawać równą wysokość,
 * a nie trafiać w siatkę 4px.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(resolve(ROOT, file), 'utf8');

const FILES = ['tokens', 'base', 'layout', 'components'];
const css = Object.fromEntries(FILES.map((name) => [name, read(`src/css/${name}.css`)]));
const all = Object.values(css).join('\n');

/** Deklaracje danej właściwości wraz z numerem linii i plikiem. */
function declarations(pattern) {
  const found = [];
  for (const [file, source] of Object.entries(css)) {
    source.split('\n').forEach((line, index) => {
      const match = line.match(pattern);
      if (match) found.push({ file: `${file}.css`, line: index + 1, text: line.trim(), value: match[1] });
    });
  }
  return found;
}

test('skala odstępów jest kompletna i rosnąca', () => {
  const scale = [...css.tokens.matchAll(/--s-(\d+):\s*(\d+)px;/g)].map(([, name, value]) => ({
    name: `--s-${name}`,
    px: Number(value),
  }));

  assert.ok(scale.length >= 7, 'skala wygląda na okrojoną');
  for (let i = 1; i < scale.length; i += 1) {
    assert.ok(
      scale[i].px > scale[i - 1].px,
      `skala nie rośnie: ${scale[i - 1].name} (${scale[i - 1].px}px) przed ${scale[i].name} (${scale[i].px}px)`
    );
  }
});

test('każdy gap i margin pochodzi ze skali', () => {
  const spacing = declarations(/^\s*(?:gap|row-gap|column-gap|margin(?:-[a-z]+)?)\s*:\s*([^;]+);/);
  assert.ok(spacing.length > 20, 'spodziewam się kilkudziesięciu deklaracji odstępów');

  const allowed = /^(?:var\(--s-[\w-]+\)|0|auto|calc\([^)]*var\(--s-[\w-]+\)[^)]*\))(\s+(?:var\(--s-[\w-]+\)|0|auto))*$/;

  const offenders = spacing
    .filter((entry) => !allowed.test(entry.value.trim()))
    .map((entry) => `${entry.file}:${entry.line} → ${entry.text}`);

  assert.deepEqual(
    offenders,
    [],
    `odstępy spoza skali (użyj var(--s-…)):\n${offenders.join('\n')}`
  );
});

test('wysokość kontrolek pochodzi z jednego tokenu', () => {
  // Bez tego rząd „ikona + pole + lista + przycisk" ma cztery różne wysokości.
  assert.match(css.tokens, /--control:\s*\d+px;/);
  assert.match(css.tokens, /--control-sm:\s*\d+px;/);

  for (const selector of ['.input', '.btn', '.btn--sm', '.chip']) {
    const block = css.components.slice(css.components.indexOf(`\n${selector} {`));
    const body = block.slice(0, block.indexOf('}'));
    assert.match(
      body,
      /min-height:\s*var\(--control(-sm)?\)/,
      `${selector} nie używa tokenu wysokości`
    );
  }
});

test('kolory żyją wyłącznie w tokens.css', () => {
  // Reszta arkuszy ma sięgać po var(--…). Inaczej ciemny motyw zawsze gdzieś
  // przecieknie: jedna zapieczona wartość i element zostaje jasny.
  const offenders = [];
  for (const file of ['base', 'layout', 'components']) {
    css[file].split('\n').forEach((line, index) => {
      if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(line) && !line.trim().startsWith('*')) {
        offenders.push(`${file}.css:${index + 1} → ${line.trim()}`);
      }
    });
  }

  assert.deepEqual(offenders, [], `kolory poza tokens.css:\n${offenders.join('\n')}`);
});

test('promienie i czasy animacji też są tokenami', () => {
  const radii = declarations(/^\s*border-radius:\s*([^;]+);/);
  const offenders = radii
    .filter((entry) => !/var\(--r|50%|999px/.test(entry.value))
    .map((entry) => `${entry.file}:${entry.line} → ${entry.text}`);
  assert.deepEqual(offenders, [], `promienie spoza skali:\n${offenders.join('\n')}`);

  const transitions = declarations(/^\s*transition:\s*([^;]+);/);
  for (const entry of transitions) {
    assert.match(
      entry.value,
      /var\(--fast\)|var\(--slow\)/,
      `${entry.file}:${entry.line} — czas animacji spoza tokenów: ${entry.text}`
    );
  }
});

test('rytm pionowy: karty stoją bliżej siebie niż ich własny padding', () => {
  // To jest cała zasada, dzięki której sekcja czyta się jako jedna rzecz,
  // a nie jako trzy przypadkowe elementy pływające w bieli.
  const value = (name) => Number(css.tokens.match(new RegExp(`${name}:\\s*(\\d+)px`))[1]);

  const gapToken = css.layout.match(/\.col--form \{[^}]*gap:\s*var\((--s-[\w-]+)\)/s)[1];
  const padToken = css.components.match(/\.section,\s*\n\.presets \{[^}]*padding:\s*var\((--s-[\w-]+)\)/s)[1];

  assert.ok(
    value(gapToken) < value(padToken),
    `przerwa między kartami (${value(gapToken)}px) musi być mniejsza niż padding w środku (${value(padToken)}px)`
  );
});

test('nie ma osieroconych tokenów', () => {
  const defined = [...css.tokens.matchAll(/^\s{2}(--[\w-]+):/gm)].map((match) => match[1]);
  const unused = defined.filter((name) => {
    const uses = all.split(`var(${name})`).length - 1;
    return uses === 0;
  });

  assert.deepEqual(unused, [], `tokeny zdefiniowane, ale nieużywane: ${unused.join(', ')}`);
});
