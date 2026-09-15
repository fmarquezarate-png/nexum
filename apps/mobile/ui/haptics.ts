/**
 * Vibración.
 *
 * REGLA: la vibración confirma que algo ha pasado EN EL MUNDO REAL, no
 * que el dedo ha tocado la pantalla. Encender el aire vibra; abrir una
 * pantalla, no. Una app que vibra con todo cansa en dos días y la gente
 * acaba desactivando la vibración del sistema entera.
 *
 * Centralizado aquí para que ningún componente llame a expo-haptics por
 * su cuenta: así la regla se puede auditar leyendo un solo archivo.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// En web no existe la API y lanzaría error.
const disponible = Platform.OS === 'ios' || Platform.OS === 'android';

/** Interruptor de Ajustes → "Vibración". Activado por defecto. */
let activada = true;

/** Lo llama el proveedor de tema cuando el usuario cambia el ajuste. */
export function configurarVibracion(valor: boolean) {
  activada = valor;
}

/**
 * Importancia relativa. Si dos vibraciones caen en menos de 120 ms gana
 * la más significativa y la otra se descarta: dos vibraciones seguidas
 * se perciben como un fallo del móvil, no como dos confirmaciones.
 */
const PESO = { seleccion: 0, impacto: 1, notificacion: 2 } as const;
type Familia = keyof typeof PESO;

const SEPARACION_MS = 120;
let ultimoInstante = 0;
let ultimoPeso = -1;

function permitido(familia: Familia): boolean {
  if (!activada || !disponible) return false;

  const ahora = Date.now();
  const dentroDeLaVentana = ahora - ultimoInstante < SEPARACION_MS;
  if (dentroDeLaVentana && PESO[familia] <= ultimoPeso) return false;

  ultimoInstante = ahora;
  ultimoPeso = PESO[familia];
  return true;
}

function lanzar(familia: Familia, fn: () => Promise<void>) {
  if (!permitido(familia)) return;
  void fn().catch(() => {
    // La vibración acompaña, nunca sustituye a lo visible: si falla,
    // el usuario ya se ha enterado por la pantalla.
  });
}

/**
 * Acción con efecto real sobre el hogar: encender, regar, borrar, canjear.
 * Media, no ligera: es la diferencia entre "he tocado" y "ha pasado algo".
 */
export const confirmarAccion = () =>
  lanzar('impacto', () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

/** Interruptor de automatización o cambio de escena. Un solo golpe, al cambiar. */
export const cambiarValor = () =>
  lanzar('seleccion', () =>
    // selectionAsync es casi imperceptible en muchos Android: allí se
    // sustituye por un impacto ligero.
    Platform.OS === 'android'
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      : Haptics.selectionAsync(),
  );

/** El servidor ha respondido que sí. Al responder, no al pulsar. */
export const confirmarRed = () =>
  lanzar('notificacion', () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );

/** Un comando ha fallado o una validación no pasa. */
export const errorDeComando = () =>
  lanzar('notificacion', () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

/** Se abre el diálogo de una acción destructiva. Al abrirlo, no al confirmar. */
export const avisarDestructivo = () =>
  lanzar('notificacion', () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  );
