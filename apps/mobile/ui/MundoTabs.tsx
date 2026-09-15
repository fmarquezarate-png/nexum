import { Tabs } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PuertaNexum } from './PuertaNexum';
import { useTheme } from './ThemeProvider';
import { themeForModule } from './theme';
import { layout, typography } from './tokens';
import type { ModuleId } from '@nexum/shared-types';
import type { ImageSourcePropType } from 'react-native';

interface MundoTabsProps {
  modulo: ModuleId;
  logo: ImageSourcePropType;
  children: React.ReactNode;
}

/**
 * La barra de pestañas de un mundo de módulo.
 *
 * Resuelve de una vez la cabecera con la puerta de salida, el logotipo y
 * el acento del módulo, para que el layout de un mundo nuevo sea seis
 * líneas. Cuando llegue Plantico, se copia.
 *
 * El acento del módulo solo tiñe la PESTAÑA ACTIVA —un icono y un rótulo,
 * menos del 1% de la pantalla—. El fondo de la barra sigue siendo la
 * superficie de Nexum: es lo que mantiene la sensación de estar dentro de
 * la misma app y no en tres apps distintas.
 */
export function MundoTabs({ modulo, logo, children }: MundoTabsProps) {
  const { colors, shadow, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const acento = themeForModule(modulo, scheme);

  return (
    <View style={[styles.mundo, { backgroundColor: colors.canvas }]}>
      <View style={[styles.cabecera, { paddingTop: insets.top + 6 }]}>
        <PuertaNexum />
        {/* El logotipo, centrado y sin teñir: es la marca del mundo. */}
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <View style={styles.equilibrio} />
      </View>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: acento.primary,
          tabBarInactiveTintColor: colors.textFaint,
          tabBarStyle: [
            styles.barra,
            shadow.subtle,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
              // Sin un mínimo, en pantallas sin zona segura inferior la
              // barra queda tan justa que recorta los rótulos por abajo.
              height: layout.tabBarHeight + Math.max(insets.bottom, 14),
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ],
          tabBarLabelStyle: typography.tabLabel,
        }}
      >
        {children}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  mundo: { flex: 1 },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: 6,
  },
  logo: { width: 30, height: 30 },
  /** Mismo ancho aproximado que la puerta, para que el logo quede centrado. */
  equilibrio: { width: 78 },
  barra: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
});
