import { StyleSheet, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { radius } from './tokens';

interface IconTileProps {
  children: React.ReactNode;
  /** Color de fondo. Por defecto, el acento neutro de Nexum. */
  fondo?: string;
  tamano?: 32 | 44 | 56;
}

/**
 * Azulejo redondeado que enmarca un icono.
 *
 * Es la pieza que da el aire de los mockups: el icono nunca va suelto
 * sobre la tarjeta, siempre dentro de su cuadradito de color. También es
 * donde vive el color del módulo (cyan de Coolio, verde de Plantico) sin
 * invadir el resto de la interfaz.
 */
export function IconTile({ children, fondo, tamano = 44 }: IconTileProps) {
  const { colors } = useTheme();
  const r = tamano === 32 ? radius.sm : tamano === 44 ? radius.md : radius.lg;

  return (
    <View
      style={[
        styles.caja,
        {
          width: tamano,
          height: tamano,
          borderRadius: r,
          backgroundColor: fondo ?? colors.surfaceAccent,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', justifyContent: 'center' },
});
