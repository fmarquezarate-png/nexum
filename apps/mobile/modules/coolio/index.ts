/**
 * Manifiesto de Coolio — climatización por infrarrojos.
 *
 * Es lo único que Nexum sabe de Coolio. Todo lo demás —el dial, los
 * programas, el emparejado del ESP32— vive dentro de su mundo, en
 * app/(mundos)/coolio/.
 */

import type { ModuleManifest } from '../tipos';

export const manifiesto: ModuleManifest = {
  id: 'coolio',
  nombre: 'Coolio',
  estado: 'disponible',
  ruta: '/coolio',
  logo: require('../../assets/marcas/coolio.png'),
  mascota: require('../../assets/mascotas/airi.png'),
  tagline: 'Controla tu aire acondicionado.',

  /**
   * Devuelve null mientras no haya aparatos emparejados: el emparejado
   * real llega con la fase 2. Y null significa que Nexum no dibuja NADA
   * de Coolio en su portada, que es justo lo que debe pasar cuando no
   * tienes ningún aire.
   */
  async resumenDeHogar() {
    return null;
  },
};
