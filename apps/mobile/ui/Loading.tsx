import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { spacing, typography } from './tokens';

/**
 * Estado de carga.
 *
 * Con texto opcional: una ruedecita sola durante más de un segundo parece
 * que la app se ha colgado.
 */
export function Loading({ texto }: { texto?: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.caja}>
      <ActivityIndicator color={colors.brand} />
      {texto ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>{texto}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.huge, gap: spacing.md },
});
