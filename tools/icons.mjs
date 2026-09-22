/**
 * icons.mjs — generuje PNG-i dla PWA z tego samego logo, co reszta aplikacji.
 *
 *   node tools/icons.mjs
 *
 * Po co własny rasteryzer i enkoder PNG, skoro jest sharp/resvg?
 * Bo logo to trzy kształty (zaokrąglony kwadrat, „szewron" i kursor), a cała
 * reszta projektu nie ma ani jednej zależności — dokładanie 30 MB binarki po to,
 * żeby raz na zawsze narysować cztery ikonki, byłoby zabawne w złym sensie.
 *
 * Jak to działa:
 *   1. Dla każdego piksela bierzemy 16 próbek (siatka 4×4) i sprawdzamy,
 *      do którego kształtu należą — to daje wygładzone krawędzie.
 *   2. Bufor RGBA pakujemy w PNG ręcznie: sygnatura, IHDR, IDAT (zlib
 *      z wbudowanego modułu), IEND. CRC-32 liczymy sami.
 *
 * PNG-i są w repo (assets/pwa/), więc build ich nie potrzebuje — ten skrypt
 * uruchamia się tylko wtedy, gdy zmienia się logo.
 */

import { deflateSync } from 'node:zlib';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'assets/pwa');

// —— kolory (te same co w logo) ————————————————————————————————
const BG = [0x0b, 0x0b, 0x0c];
const FG = [0xff, 0xff, 0xff];
const CURSOR = [0xee, 0x7f, 0x2d];

// —— geometria w układzie 24×24, jeden do jednego z logo ——————————
const CHEVRON = [
  [6.6, 8.4],
  [10.2, 12],
  [6.6, 15.6],
];
const CHEVRON_HALF = 1.1; // połowa grubości kreski (stroke-width 2.2)
const CURSOR_BOX = { x: 12.6, y: 13.6, w: 5.4, h: 2.4, r: 1.2 };
const CARD_RADIUS = 6;

// —— pomocniki geometryczne ————————————————————————————————————

/** Odległość punktu od odcinka. */
function distanceToSegment(px, py, [ax, ay], [bx, by]) {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSquared = abx * abx + aby * aby;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSquared));
  const dx = px - (ax + abx * t);
  const dy = py - (ay + aby * t);
  return Math.hypot(dx, dy);
}

/** Czy punkt leży w prostokącie o zaokrąglonych rogach. */
function inRoundedRect(px, py, { x, y, w, h, r }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const qx = Math.abs(px - cx) - (w / 2 - r);
  const qy = Math.abs(py - cy) - (h / 2 - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - r <= 0;
}

/**
 * Kolor i krycie w punkcie (współrzędne w układzie 24×24 samego znaku).
 * `card` decyduje, czy tło ma zaokrąglone rogi (ikona wolnostojąca),
 * czy wypełnia wszystko (wariant maskowalny i ten dla iOS).
 */
function sample(gx, gy, card) {
  const insideCard = card ? inRoundedRect(gx, gy, { x: 0, y: 0, w: 24, h: 24, r: CARD_RADIUS }) : true;
  if (!insideCard) return null;

  const onChevron =
    distanceToSegment(gx, gy, CHEVRON[0], CHEVRON[1]) <= CHEVRON_HALF ||
    distanceToSegment(gx, gy, CHEVRON[1], CHEVRON[2]) <= CHEVRON_HALF;
  if (onChevron) return FG;

  if (inRoundedRect(gx, gy, CURSOR_BOX)) return CURSOR;

  return BG;
}

/**
 * Rysuje ikonę.
 * @param {number} size - bok w pikselach
 * @param {'rounded'|'bleed'|'maskable'} mode
 */
function render(size, mode) {
  const pixels = Buffer.alloc(size * size * 4);
  const samples = 4; // 4×4 próbki na piksel
  const card = mode === 'rounded';

  // Wariant maskowalny musi zmieścić się w „bezpiecznym polu" (80% średnicy),
  // więc sam znak jest mniejszy, a tło wypełnia cały kafelek.
  const glyphScale = mode === 'maskable' ? 0.62 : 1;
  const unit = (size * glyphScale) / 24;
  const offset = (size - size * glyphScale) / 2;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const px = x + (sx + 0.5) / samples;
          const py = y + (sy + 0.5) / samples;

          // Tło pełnoekranowe rysujemy w układzie ekranu, a znak w swoim.
          const bleed = mode !== 'rounded';
          const gx = (px - (bleed ? offset : 0)) / unit;
          const gy = (py - (bleed ? offset : 0)) / unit;

          let color = sample(gx, gy, card);
          if (!color && bleed) color = BG; // poza znakiem, ale wciąż na kafelku
          if (!color) continue;

          r += color[0];
          g += color[1];
          b += color[2];
          a += 255;
        }
      }

      const total = samples * samples;
      const index = (y * size + x) * 4;
      const alpha = a / total;
      pixels[index] = alpha > 0 ? Math.round(r / (a / 255)) : 0;
      pixels[index + 1] = alpha > 0 ? Math.round(g / (a / 255)) : 0;
      pixels[index + 2] = alpha > 0 ? Math.round(b / (a / 255)) : 0;
      pixels[index + 3] = Math.round(alpha);
    }
  }

  return pixels;
}

// —— enkoder PNG ————————————————————————————————————————————————

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // 8 bitów na kanał
  header[9] = 6; // RGBA
  header[10] = 0; // deflate
  header[11] = 0; // filtr adaptacyjny
  header[12] = 0; // bez przeplotu

  // Każdy wiersz poprzedzony bajtem filtra (0 = brak).
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// —— co generujemy ——————————————————————————————————————————————

const TARGETS = [
  { file: 'icon-192.png', size: 192, mode: 'rounded' },
  { file: 'icon-512.png', size: 512, mode: 'rounded' },
  { file: 'icon-maskable-512.png', size: 512, mode: 'maskable' },
  { file: 'apple-touch-icon.png', size: 180, mode: 'bleed' },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const target of TARGETS) {
    const png = encodePng(target.size, render(target.size, target.mode));
    await writeFile(resolve(OUT_DIR, target.file), png);
    console.log(`[icons] assets/pwa/${target.file} — ${target.size}px, ${(png.length / 1024).toFixed(1)} kB`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
