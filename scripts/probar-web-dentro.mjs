/**
 * Prueba de humo de las pantallas de DENTRO, en un navegador real.
 *
 * probar-web.mjs solo llega hasta el login: todo lo interesante —Inicio,
 * Dispositivos, Estadísticas, Mis casas— vive detrás de una sesión. Este
 * script entra, y lo hace SIN TOCAR LA BASE DE DATOS REAL: intercepta
 * todo el tráfico a Supabase y responde él mismo. No se crea ningún
 * usuario, no se escribe nada, no hace falta contraseña de nadie.
 *
 * Lo que caza: hooks mal usados, contextos que faltan, pantallas que
 * revientan al montarse. Lo que NO caza: que las consultas SQL reales
 * estén bien —eso lo prueba scripts/probar-rls.sh.
 *
 *   1. npm run build:web --workspace apps/mobile
 *   2. node scripts/servir-dist.mjs        (dejarlo corriendo aparte)
 *   3. node scripts/probar-web-dentro.mjs
 */

import { readdirSync, readFileSync } from 'node:fs';

import { chromium } from 'playwright';

const URL_BASE = process.env.URL_BASE ?? 'http://127.0.0.1:4173/';
const CHROMIUM = process.env.CHROMIUM_PATH;

/**
 * El proyecto de Supabase se saca del bundle ya construido, no se
 * escribe aquí a mano: supabase-js deriva de esa URL tanto el nombre de
 * la clave de sesión (`sb-<ref>-auth-token`) como el dominio al que
 * llama, y si el script y el build no coinciden la sesión falsa no se
 * lee y la prueba dice "no tienes ninguna casa" sin que nada falle.
 */
const REF = (() => {
  const dir = 'apps/mobile/dist/_expo/static/js/web';
  for (const f of readdirSync(dir)) {
    const m = readFileSync(`${dir}/${f}`, 'utf8').match(/https:\/\/([a-z0-9-]+)\.supabase\.co/);
    if (m) return m[1];
  }
  throw new Error('No encuentro la URL de Supabase en el bundle. ¿Has construido la web?');
})();
console.log(`Proyecto del bundle: ${REF}.supabase.co`);

const AHORA = Math.floor(Date.now() / 1000);
const USUARIO = {
  id: '00000000-0000-4000-8000-000000000001',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'prueba@ejemplo.test',
  user_metadata: { display_name: 'Fran de Prueba' },
  app_metadata: {},
  created_at: new Date().toISOString(),
};
const SESION = {
  access_token: 'token-de-mentira',
  refresh_token: 'refresco-de-mentira',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: AHORA + 3600,
  user: USUARIO,
};

const CASAS = [
  { id: 'casa-1', name: 'Casa Banana', timezone: 'Europe/Madrid', created_by: USUARIO.id },
  { id: 'casa-2', name: 'Apartamento', timezone: 'Europe/Madrid', created_by: USUARIO.id },
];

const errores = [];
const nav = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
const MODO = process.env.MODO === 'oscuro' ? 'dark' : 'light';
const ctx = await nav.newContext({
  viewport: { width: 390, height: 844 },
  colorScheme: MODO,
});
console.log(`Modo de color: ${MODO}`);

// La sesión tiene que estar puesta ANTES de que arranque el bundle, o
// AuthProvider decide que no hay usuario y manda al login.
await ctx.addInitScript(
  ([ref, sesion]) => {
    window.localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify(sesion));
  },
  [REF, SESION],
);

const pag = await ctx.newPage();
pag.on('console', (m) => {
  if (m.type() === 'error') errores.push('CONSOLA: ' + m.text());
});
pag.on('pageerror', (e) => errores.push('EXCEPCIÓN: ' + e.message));

const json = (ruta, cuerpo, cabeceras = {}) =>
  ruta.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*', ...cabeceras },
    body: JSON.stringify(cuerpo),
  });

await pag.route(`**/*.supabase.co/**`, async (ruta) => {
  const url = new URL(ruta.request().url());
  const c = url.pathname + url.search;
  if (process.env.VERBOSO) console.log('  →', ruta.request().method(), c.slice(0, 120));

  if (c.includes('/auth/v1/user')) return json(ruta, USUARIO);
  if (c.includes('/auth/v1/token')) return json(ruta, SESION);
  if (c.includes('/auth/v1/logout')) return json(ruta, {});

  if (c.includes('/rest/v1/profiles')) {
    const perfil = { id: USUARIO.id, display_name: 'Fran de Prueba', avatar_url: null };
    // PostgREST devuelve un objeto suelto, y no una lista, cuando la
    // consulta usa .single(). Si el simulacro no lo respeta, el perfil
    // llega mal y el saludo sale vacío sin que nada falle.
    const suelto = (ruta.request().headers().accept ?? '').includes('pgrst.object');
    return json(ruta, suelto ? perfil : [perfil]);
  }

  if (c.includes('/rest/v1/home_members'))
    return json(
      ruta,
      CASAS.map((h) => ({ role: 'owner', homes: h })),
    );

  // Cuenta de dispositivos: PostgREST la devuelve en la cabecera.
  if (c.includes('/rest/v1/devices'))
    return json(ruta, [], { 'content-range': '*/0' });

  if (c.includes('/rest/v1/rooms')) return json(ruta, []);
  return json(ruta, []);
});

const resumen = (texto) => texto.trim().split('\n').filter(Boolean).join(' | ');

// Con CAPTURAS=<carpeta> además guarda una foto de cada pantalla, que es
// la única forma de revisar el diseño sin tener el móvil delante.
const CAPTURAS = process.env.CAPTURAS;
let n = 0;
async function foto(titulo) {
  if (!CAPTURAS) return;
  const nombre = `${String(++n).padStart(2, '0')}-${MODO}-${titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.png`;
  await pag.screenshot({ path: `${CAPTURAS}/${nombre}`, fullPage: true });
}

async function mirar(titulo, ruta, despues) {
  await pag.goto(URL_BASE.replace(/\/$/, '') + ruta, { waitUntil: 'networkidle' });
  await pag.waitForTimeout(1800);
  if (despues) await despues();
  console.log(`\n── ${titulo} ──`);
  console.log(resumen(await pag.innerText('body')));
  await foto(titulo);
}

await mirar('Inicio', '/');
await mirar('Dispositivos', '/dispositivos');
await mirar('Estadísticas', '/estadisticas');
await mirar('Mis casas', '/casas');

// El selector de casa: abrir la hoja y cambiar de casa.
await pag.goto(URL_BASE, { waitUntil: 'networkidle' });
await pag.waitForTimeout(1800);
await pag.getByText('Casa Banana', { exact: true }).first().click();
await pag.waitForTimeout(900);
console.log('\n── Hoja del selector de casa ──');
console.log(resumen(await pag.innerText('body')));
await foto('selector abierto');

await pag.getByText('Apartamento', { exact: true }).first().click();
await pag.waitForTimeout(900);
console.log('\n── Tras cambiar de casa ──');
console.log(resumen(await pag.innerText('body')));

// El botón de tema: pulsar tiene que cambiar el fondo de verdad.
await pag.goto(URL_BASE, { waitUntil: 'networkidle' });
await pag.waitForTimeout(1800);
const fondoAntes = await pag.evaluate(() => getComputedStyle(document.body).backgroundColor);
await pag.getByLabel(/Cambiar a modo/).first().click();
await pag.waitForTimeout(900);
const fondoDespues = await pag.evaluate(() => getComputedStyle(document.body).backgroundColor);
console.log(`\n── Botón de tema ──`);
console.log(`fondo antes: ${fondoAntes} → después: ${fondoDespues}`);
if (fondoAntes === fondoDespues) errores.push('EL BOTÓN DE TEMA NO CAMBIA NADA');
await foto('tema cambiado');

console.log('\n── Errores ──');
console.log(errores.length ? errores.slice(0, 20).join('\n') : 'ninguno');

await nav.close();
process.exit(errores.length ? 1 : 0);
