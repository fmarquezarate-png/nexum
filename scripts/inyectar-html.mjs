/**
 * Añade al index.html generado las etiquetas que permiten instalar la app.
 *
 * POR QUÉ HACE FALTA ESTE PASO
 *
 * Expo Router permite personalizar el documento HTML con un archivo
 * `app/+html.tsx`, pero SOLO cuando la salida web es "static". La nuestra
 * es "single" —una sola página, con el enrutado en el navegador— y en ese
 * modo Expo genera su HTML por su cuenta e ignora ese archivo.
 *
 * Cambiar a "static" obligaría a renderizar la app en el servidor durante
 * la construcción, y la app usa cosas que solo existen en el navegador
 * (almacenamiento local, tema del sistema). No compensa el riesgo por unas
 * etiquetas, así que se añaden aquí, después de construir.
 *
 * Es idempotente: si ya están puestas, no hace nada.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(AQUI, '..', 'apps', 'mobile', 'dist', 'index.html');

const MARCA = '<!-- nexum:instalable -->';

const ETIQUETAS = `${MARCA}
    <meta name="description" content="Todos tus dispositivos en un solo lugar." />

    <!-- Instalación en Android y escritorio -->
    <link rel="manifest" href="/manifest.webmanifest" />

    <!-- iOS ignora el manifiesto y usa estas -->
    <link rel="apple-touch-icon" sizes="180x180" href="/iconos/nexum-180.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Nexum" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />

    <link rel="icon" type="image/png" sizes="192x192" href="/iconos/nexum-192.png" />

    <!-- La barra del sistema acompaña al tema del móvil -->
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FAF8F4" />
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#100F0B" />

    <!-- Fondo antes de que arranque JavaScript: sin esto, abrir en modo
         oscuro da un fogonazo blanco durante un instante -->
    <style>
      body { background-color: #FAF8F4; }
      @media (prefers-color-scheme: dark) { body { background-color: #100F0B; } }
    </style>`;

const html = await readFile(INDEX, 'utf8');

if (html.includes(MARCA)) {
  console.log('index.html ya estaba preparado, no se toca.');
  process.exit(0);
}

let salida = html
  // El idioma del documento: Expo pone "en" y la app está en castellano.
  .replace('<html lang="en">', '<html lang="es">')
  // viewport-fit=cover deja pintar bajo la muesca del iPhone; de las
  // zonas seguras ya se ocupa SafeAreaView dentro de la app.
  .replace(
    'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
    'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"',
  )
  .replace('<title>Nexum</title>', `<title>Nexum — Tu hogar, más simple</title>\n    ${ETIQUETAS}`);

if (!salida.includes(MARCA)) {
  console.error('ERROR: no se ha encontrado el <title> esperado en index.html.');
  console.error('Expo habrá cambiado su plantilla. Revisa scripts/inyectar-html.mjs.');
  process.exit(1);
}

await writeFile(INDEX, salida, 'utf8');
console.log('index.html preparado para instalar en la pantalla de inicio.');
