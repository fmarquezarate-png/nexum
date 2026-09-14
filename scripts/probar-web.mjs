/**
 * Prueba de humo de la app en un navegador real.
 *
 * Abre la versión web ya construida a tamaño de móvil, navega entre
 * pantallas y avisa de cualquier error de JavaScript. Sirve para cazar
 * fallos que ni TypeScript ni el empaquetado detectan, como el de las
 * dos copias de React que rompía todos los hooks.
 *
 * No forma parte de la app ni se despliega. Se ejecuta a mano:
 *
 *   1. npm run build:web --workspace apps/mobile
 *   2. node scripts/servir-dist.mjs        (dejarlo corriendo aparte)
 *   3. npm install --no-save playwright
 *   4. node scripts/probar-web.mjs
 */

import { chromium } from 'playwright';

const URL_BASE = process.env.URL_BASE ?? 'http://127.0.0.1:4173/';
const CHROMIUM = process.env.CHROMIUM_PATH; // si no, el que traiga playwright

const errores = [];
const nav = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } }); // iPhone 14
const pag = await ctx.newPage();

pag.on('console', (m) => {
  if (m.type() === 'error') errores.push('CONSOLA: ' + m.text());
});
pag.on('pageerror', (e) => errores.push('EXCEPCIÓN: ' + e.message));

const resumen = (texto) => texto.trim().split('\n').filter(Boolean).join(' | ');

await pag.goto(URL_BASE, { waitUntil: 'networkidle' });
await pag.waitForTimeout(2500);
console.log('── Inicio de sesión ──');
console.log(resumen(await pag.innerText('body')));

const crearCuenta = pag.getByText('Crear cuenta', { exact: true }).first();
if (await crearCuenta.count()) {
  await crearCuenta.click();
  await pag.waitForTimeout(1200);
  console.log('── Crear cuenta ──');
  console.log(resumen(await pag.innerText('body')));
}

console.log('── Errores ──');
console.log(errores.length ? errores.slice(0, 15).join('\n') : 'ninguno');

await nav.close();
process.exit(errores.length ? 1 : 0);
