import { StyleSheet, View } from 'react-native';

import { colors } from './tokens';

/** Línea fina separadora entre filas de una lista. */
export function Divider() {
  return <View style={styles.linea} />;
}

const styles = StyleSheet.create({
  linea: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
