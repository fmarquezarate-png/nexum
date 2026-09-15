/**
 * La forma del manifiesto de un módulo.
 *
 * Un módulo (Coolio, Plantico…) es un mundo con su propia identidad y sus
 * propias pantallas. Expo Router descubre solo sus RUTAS, pero la portada
 * de Nexum necesita DATOS de cada módulo —su logotipo, su lema, su
 * resumen— y eso no se puede adivinar de una carpeta.
 *
 * Este archivo define qué puede saber Nexum de un módulo. Y, sobre todo,
 * qué NO: la mascota está aquí porque la usa el propio mundo, pero
 * ninguna pantalla de Nexum la lee. Una mascota no cruza la puerta.
 */

import type { ImageSourcePropType } from 'react-native';
import type { ModuleId } from '@nexum/shared-types';

/** Cómo va un módulo en una casa concreta. */
export type EstadoResumen = 'ok' | 'aviso' | 'apagado' | 'sinSenal';

export interface ResumenModulo {
  estado: EstadoResumen;
  /** "Todo bien", "Nivel de agua bajo". Una frase corta. */
  textoEstado: string;
  /** Como mucho tres líneas de datos. Más no cabe en la tarjeta. */
  lineas: string[];
  /** Algo concreto que abrir desde la tarjeta. */
  destacado?: { titulo: string; ruta: string };
}

export interface ModuleManifest {
  id: ModuleId;
  /** Nombre visible. */
  nombre: string;
  /**
   * 'disponible' → su tarjeta entra en su mundo.
   * 'proximamente' → su tarjeta abre una ficha de "aún no está".
   */
  estado: 'disponible' | 'proximamente';
  /** Puerta de entrada al mundo. Solo tiene sentido si está disponible. */
  ruta: `/${string}`;
  /** Logotipo. NUNCA se tiñe: es la marca del módulo. */
  logo: ImageSourcePropType;
  /**
   * Mascota del módulo.
   *
   * ⚠ Solo la usa el propio mundo. Ninguna pantalla de Nexum debe leer
   * este campo: que Airi apareciera en las estadísticas de Nexum, sin
   * haber entrado nunca en Coolio, es el fallo que este contrato evita.
   */
  mascota?: ImageSourcePropType;
  tagline: string;
  /**
   * Lo que enseña su tarjeta en "Mis dispositivos".
   *
   * ⚠ CONTRATO: devuelve null si el módulo no tiene NINGÚN dispositivo en
   * esa casa. Con null, Nexum no dibuja nada suyo: ni tarjeta, ni fila de
   * estadísticas, ni color. El módulo sigue apareciendo solo en "Apps
   * integradas", que es el catálogo de lo que existe, no de lo que tienes.
   */
  resumenDeHogar: (homeId: string) => Promise<ResumenModulo | null>;
}
