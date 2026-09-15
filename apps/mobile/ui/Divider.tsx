import { StyleSheet, View } from 'react-native';

import { useTheme } from './ThemeProvider';
import { layout } from './tokens';

/**
 * Línea fina entre filas de una lista.
 *
 * 1 px exacto, no `hairlineWidth`: a densidad 3 el pelo del sistema se
 * queda en 0,33 px y en pantalla se ve como un gris irregular que
 * aparece y desaparece según dónde caiga la fila.
 *
 * Dentro de una tarjeta va a ancho completo del contenido; sangrada solo
 * cuando separa filas que empiezan con un azulejo de icono, para que la
 * línea nazca donde nace el texto.
 */
export function Divider({ sangrado = false }: { sangrado?: boolean } = {}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.linea,
        { backgroundColor: colors.divider },
        sangrado && { marginLeft: layout.cardPadding },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  linea: { height: 1 },
});
