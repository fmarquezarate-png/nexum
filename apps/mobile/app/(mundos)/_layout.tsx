import { Stack } from 'expo-router';

import { useTheme } from '@/ui';

/**
 * Contenedor de mundos. NÚCLEO, y genérico a propósito.
 *
 * No nombra ningún módulo: Expo Router descubre las carpetas hijas solo,
 * así que añadir Plantico no obliga a tocar este archivo.
 *
 * Es el único sitio donde se define cómo se entra y se sale de un mundo.
 * Como la barra de pestañas viaja con su pantalla, el deslizamiento
 * horizontal hace que se vea salir la barra verde de Nexum y entrar la
 * del módulo en el mismo gesto: no hace falta animar nada más.
 */
export default function MundosLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  );
}
