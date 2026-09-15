/**
 * Vibración.
 *
 * REGLA: solo vibra lo que tiene un efecto real sobre el hogar —encender
 * el aire, borrar una casa, canjear un código—. Nunca al navegar, nunca
 * al hacer scroll, nunca al abrir una pantalla.
 *
 * Una app que vibra con todo cansa en dos días y la gente desactiva la
 * vibración del sistema entera.
 *
 * Centralizado aquí para que ningún componente llame a expo-haptics por
 * su cuenta: así la regla se puede auditar leyendo un solo archivo.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// En web no existe la API y lanzaría error.
const disponible = Platform.OS === 'ios' || Platform.OS === 'android';

async function seguro(fn: () => Promise<void>) {
  if (!disponible) return;
  try {
    await fn();
  } catch {
    // La vibración es un adorno: si falla, no pasa nada.
  }
}

/** Acción con efecto real: encender, apagar, guardar, canjear. */
export const vibrarAccion = () =>
  void seguro(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** Confirmación de algo importante: casa creada, código canjeado. */
export const vibrarExito = () =>
  void seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

/** Algo ha salido mal y el usuario tiene que enterarse. */
export const vibrarError = () =>
  void seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

/** Aviso antes de una acción destructiva. */
export const vibrarAviso = () =>
  void seguro(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
