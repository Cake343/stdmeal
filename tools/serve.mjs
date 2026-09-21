/**
 * serve.mjs — maly serwer statyczny na czas developmentu.
 *
 * Istnieje, bo moduly ES nie laduja sie z file:// (CORS), a nie chcialem
 * wciagac zadnej zaleznosci tylko po to, zeby oddac kilka plikow po HTTP.
 *
 *   node tools/serve.mjs [katalog] [port]
 *   npm run dev       -> zrodla (src/)
 *   npm run preview   -> zbudowany jeden plik (dist/)
 */

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] === 'dist' ? 'dist' : '.');
const port = Number(process.argv[3] ?? process.env.PORT ?? 5173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const requested = decodeURIComponent(url.pathname);
    let filePath = resolve(join(root, normalize(requested)));

    // Nie wypuszczamy sie poza katalog serwowany.
    if (filePath !== root && !filePath.startsWith(root + sep)) {
      response.writeHead(403).end('403');
      return;
    }

    let info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }

    if (!info) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404');
      return;
    }

    response.writeHead(200, {
      'content-type': TYPES[extname(filePath)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
});

server.listen(port, () => {
  console.log(`stdmeal → http://localhost:${port}  (katalog: ${root})`);
});
