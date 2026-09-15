/**
 * Manifiesto de Plantico — riego de plantas de interior.
 *
 * Todavía no tiene mundo: un mundo con las pestañas vacías sería un
 * edificio sin puertas. Aparece como tarjeta en "Apps integradas" y al
 * tocarla se abre su ficha de "aún no está".
 *
 * El día que llegue: se crea app/(mundos)/plantico/, se cambia estado a
 * 'disponible' y se le pone la ruta. Nada más.
 */

import type { ModuleManifest } from '../tipos';

export const manifiesto: ModuleManifest = {
  id: 'plantico',
  nombre: 'Plantico',
  estado: 'proximamente',
  ruta: '/modulo/plantico',
  logo: require('../../assets/marcas/plantico.png'),
  mascota: require('../../assets/mascotas/broti.png'),
  tagline: 'Riego inteligente para tus plantas.',

  async resumenDeHogar() {
    return null;
  },
};
