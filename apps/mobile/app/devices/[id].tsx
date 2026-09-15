import { useLocalSearchParams } from 'expo-router';

import { t } from '@/lib/i18n';
import { Proximamente, Screen } from '@/ui';

/**
 * Detalle de dispositivo.
 *
 * Esta pantalla NO sabe nada de Coolio ni de Plantico: mira el campo
 * `module` del dispositivo y renderiza el componente de ese módulo. Es la
 * pieza que hace que añadir Plantico no obligue a tocar el núcleo.
 */
export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <Proximamente
        quien="airi"
        titulo="El control de tu aire, aquí"
        mensaje="En cuanto emparejes un equipo, este es su sitio."
        incluye={[
          'Dial de temperatura y modo',
          'Lectura real del sensor de la habitación',
          'Temporizador y resincronizar',
        ]}
      />
    </Screen>
  );
}
