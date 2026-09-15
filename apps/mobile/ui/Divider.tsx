import { StyleSheet, View } from 'react-native';

import { useTheme } from './ThemeProvider';

/** Línea fina entre filas de una lista. */
export function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.linea, { backgroundColor: colors.divider }]} />;
}

const styles = StyleSheet.create({
  linea: { height: StyleSheet.hairlineWidth },
});
