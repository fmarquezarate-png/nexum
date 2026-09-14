import { Screen, Placeholder } from '@/ui';

/**
 * Alta de casa y emparejado de dispositivos.
 * Los 7 pasos están descritos en docs/provisioning.md.
 */
export default function OnboardingScreen() {
  return (
    <Screen title="Añadir dispositivo" subtitle="Se configura una sola vez.">
      <Placeholder phase="Fase 1" what="Paso 1 · Crear casa y habitaciones" />
      <Placeholder phase="Fase 2" what="Paso 2 · Pedir token de reclamo" />
      <Placeholder phase="Fase 2" what="Paso 3 · Guía para conectarse a la red Nexum-XXXX" />
      <Placeholder phase="Fase 2" what="Paso 4 · Esperar registro por Realtime" />
      <Placeholder phase="Fase 2" what="Paso 5 · Marca y modelo del aire + prueba de emisión IR" />
    </Screen>
  );
}
