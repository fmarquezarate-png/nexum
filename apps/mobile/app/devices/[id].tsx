import { useLocalSearchParams } from 'expo-router';

import { Screen, Placeholder } from '@/ui';

/**
 * Detalle de dispositivo.
 *
 * Esta pantalla NO sabe nada de Coolio ni de Plantico: mira el campo
 * `module` del dispositivo y renderiza el componente de ese módulo.
 * Es la pieza que hace que añadir Plantico no obligue a tocar el núcleo.
 *
 *   coolio   → modules/coolio/DeviceDetail
 *   plantico → modules/plantico/DeviceDetail
 */
export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen title="Dispositivo" subtitle={`id: ${id}`}>
      <Placeholder phase="Fase 2" what="Enrutado por módulo según devices.module" />
    </Screen>
  );
}
