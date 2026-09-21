/**
 * build.mjs — sklada zrodla w JEDEN plik dist/index.html. Zero zaleznosci.
 *
 * Po co wlasny bundler, skoro sa gotowe:
 *  - caly projekt to ~15 modulow, ktorych skladnie kontroluje w 100%,
 *  - dodanie esbuilda/rollupa oznacza node_modules w repo i w obrazie Dockera,
 *    czyli wiecej infrastruktury niz samej aplikacji,
 *  - a efekt jest dokladnie taki, jaki chce: jeden plik, ktory dziala
 *    z dwukliku, z kontenera i z GitHub Pages.
 *
 * Jak to dziala:
 *  1. Kazdy modul dostaje opakowanie w funkcje i wpis w rejestrze.
 *  2. `import { a } from './x.js'` -> `const { a } = __require('sciezka')`.
 *  3. `export ` jest usuwane, a nazwy eksportow zwracane na koncu funkcji.
 *  4. CSS ladowane <link>-ami trafia do jednego <style>.
 *
 * Swiadome ograniczenia (waliduje je `assertSupported`, wiec nie przemkna
 * niezauwazone): brak `export default`, `export *`, aliasow `as`, importow
 * dynamicznych i cykli miedzy modulami.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = 'src/js/main.js';
const OUT_DIR = resolve(ROOT, 'dist');
const OUT_FILE = resolve(OUT_DIR, 'index.html');

const IMPORT_RE = /^import\s*\{([\s\S]*?)\}\s*from\s*['"](.+?)['"];?[ \t]*$/gm;
const EXPORT_RE = /^export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;

/** Rzeczy, ktorych bundler nie obsluguje — lepiej glosny blad niz cicha wpadka. */
function assertSupported(code, id) {
  const forbidden = [
    [/^export\s+default/m, 'export default'],
    [/^export\s*\*/m, 'export *'],
    [/^export\s*\{/m, 'export { ... }'],
    [/\bimport\s*\(/, 'import() dynamiczny'],
    [/^import\s+['"]/m, 'import bez nazw (side-effect)'],
  ];
  for (const [pattern, name] of forbidden) {
    if (pattern.test(code)) {
      throw new Error(`[build] ${id}: nieobsługiwana składnia — ${name}`);
    }
  }
}

/** Sciezka importu -> klucz w rejestrze (zawsze POSIX, zawsze wzgledem repo). */
function resolveId(fromId, spec) {
  if (!spec.startsWith('.')) {
    throw new Error(`[build] ${fromId}: import spoza projektu ("${spec}") nie jest obsługiwany`);
  }
  const abs = resolve(dirname(resolve(ROOT, fromId)), spec);
  return relative(ROOT, abs).split('\\').join('/');
}

async function collect(entryId) {
  const modules = new Map();
  const queue = [entryId];

  while (queue.length > 0) {
    const id = queue.shift();
    if (modules.has(id)) continue;

    const source = await readFile(resolve(ROOT, id), 'utf8');
    assertSupported(source, id);

    const deps = [];
    let body = source.replace(IMPORT_RE, (_match, names, spec) => {
      const target = resolveId(id, spec);
      deps.push(target);
      const bindings = names
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => {
          if (/\bas\b/.test(name)) {
            throw new Error(`[build] ${id}: alias "as" w imporcie nie jest obsługiwany`);
          }
          return name;
        })
        .join(', ');
      return `const { ${bindings} } = __require(${JSON.stringify(target)});`;
    });

    const exported = [...body.matchAll(EXPORT_RE)].map((match) => match[1]);
    body = body.replace(/^export\s+/gm, '');

    modules.set(id, { id, body, exported });
    queue.push(...deps);
  }

  return modules;
}

function renderBundle(modules, entryId) {
  const registry = [...modules.values()]
    .map((module) => {
      const returns = module.exported.map((name) => `    ${name},`).join('\n');
      return [
        `  ${JSON.stringify(module.id)}: function (__require) {`,
        module.body.trimEnd(),
        '  return {',
        returns,
        '  };',
        '},',
      ].join('\n');
    })
    .join('\n');

  return `(function () {
"use strict";
var __cache = Object.create(null);
var __loading = Object.create(null);
var __modules = {
${registry}
};
function __require(id) {
  if (id in __cache) return __cache[id];
  if (__loading[id]) throw new Error("[stdmeal] cykl w imports: " + id);
  __loading[id] = true;
  var factory = __modules[id];
  if (!factory) throw new Error("[stdmeal] brak modułu: " + id);
  var exports = factory(__require);
  __cache[id] = exports;
  __loading[id] = false;
  return exports;
}
__require(${JSON.stringify(entryId)});
})();`;
}

async function main() {
  const started = Date.now();
  const html = await readFile(resolve(ROOT, 'index.html'), 'utf8');
  const version = JSON.parse(await readFile(resolve(ROOT, 'package.json'), 'utf8')).version;

  // —— CSS: wszystkie <link> -> jeden <style> ——
  const cssLinks = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g)];
  if (cssLinks.length === 0) throw new Error('[build] nie znalazłem żadnego <link rel="stylesheet">');

  const cssParts = [];
  for (const [, href] of cssLinks) {
    const code = await readFile(resolve(ROOT, href), 'utf8');
    cssParts.push(`/* ${href} */\n${code.trim()}`);
  }

  // —— JS: rejestr modulow ——
  const modules = await collect(ENTRY);
  const bundle = renderBundle(modules, ENTRY);

  // Wszystkie <link> znikaja (razem z wcieciem i koncem linii), a w ich miejsce,
  // tuz przed </head>, wchodzi jeden <style>.
  let out = html.replace(/[ \t]*<link rel="stylesheet" href="[^"]+"\s*\/?>\r?\n?/g, '');
  out = out.replace('</head>', `  <style>\n${cssParts.join('\n\n')}\n    </style>\n  </head>`);

  out = out.replace(
    /<script type="module" src="[^"]+"><\/script>/,
    `<script>\n${bundle}\n    </script>`
  );

  out = out.replace(
    '<head>',
    `<head>\n    <!-- stdmeal v${version} — zbudowane ${new Date().toISOString()} przez tools/build.mjs -->`
  );

  // —— kontrola jakosci ——
  // Uwaga: sciezki typu "src/js/state.js" wystepuja w wyniku jako klucze rejestru
  // modulow — to jest w porzadku. Chodzi o to, zeby nie zostal zaden ZASOB
  // ladowany z dysku (href=/src=), bo taki plik nie istnieje obok dist/index.html.
  if (/(?:href|src)="(?:\.\/)?src\//.test(out)) {
    throw new Error('[build] w wyniku został odnośnik do pliku z src/ — coś się nie podmieniło');
  }
  if (out.includes('<script type="module"')) {
    throw new Error('[build] został nietknięty <script type="module">');
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, out, 'utf8');

  const kb = (Buffer.byteLength(out, 'utf8') / 1024).toFixed(1);
  console.log(
    `[build] dist/index.html — ${kb} kB, ${modules.size} modułów, ${cssLinks.length} arkuszy CSS, ${Date.now() - started} ms`
  );
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
