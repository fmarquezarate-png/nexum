/**
 * Servidor mínimo para probar en local la versión web construida.
 *
 * Reproduce el comportamiento de vercel.json: cualquier ruta que no sea
 * un archivo devuelve index.html, porque el enrutado ocurre dentro del
 * navegador. Sin esto, recargar en /casas daría un 404 y la prueba no se
 * parecería a producción.
 */

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..', 'apps', 'mobile', 'dist');
const PUERTO = Number(process.env.PORT ?? 4173);

const TIPOS = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
};

http
  .createServer(async (req, res) => {
    const ruta = decodeURIComponent((req.url ?? '/').split('?')[0]);
    let archivo = path.join(RAIZ, ruta);
    let datos;
    try {
      datos = await readFile(archivo);
    } catch {
      archivo = path.join(RAIZ, 'index.html');
      datos = await readFile(archivo);
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo)] ?? 'application/octet-stream',
    });
    res.end(datos);
  })
  .listen(PUERTO, () => console.log(`Sirviendo ${RAIZ} en http://127.0.0.1:${PUERTO}`));
