import { AlertTriangle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { IconTile } from './IconTile';
import { useTheme } from './ThemeProvider';
import { avisarDestructivo } from './haptics';
import { layout, radius, spacing, typography } from './tokens';

interface ConfirmSheetProps {
  visible: boolean;
  /** Qué se va a hacer. Con el nombre real de la cosa. */
  titulo: string;
  /** Qué pasa exactamente. Con números y nombres, no vaguedades. */
  descripcion: string;
  /** Lista de consecuencias concretas: "3 habitaciones", "Ana pierde el acceso". */
  consecuencias?: string[];
  /** El verbo de la acción, no "Aceptar". */
  confirmar: string;
  /**
   * Segunda pregunta. Si se pasa, hay que confirmar dos veces.
   * Solo para lo que no tiene vuelta atrás.
   */
  segundaPregunta?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/**
 * Confirmación de una acción destructiva.
 *
 * Dos reglas que la diferencian de un diálogo cualquiera:
 *
 *   1. Dice QUÉ SE PIERDE con números reales, no "¿estás seguro?".
 *      Una pregunta sin datos se contesta que sí por inercia.
 *   2. Para lo irreversible, pregunta DOS VECES, y la segunda con otras
 *      palabras, para que el segundo sí sea una decisión y no un reflejo.
 *
 * Sin mascota, a propósito: cuando alguien va a perder algo, un dibujo
 * sonriente molesta.
 */
export function ConfirmSheet({
  visible,
  titulo,
  descripcion,
  consecuencias,
  confirmar,
  segundaPregunta,
  onConfirmar,
  onCancelar,
}: ConfirmSheetProps) {
  const { colors, shadow } = useTheme();
  const [paso, setPaso] = useState<1 | 2>(1);

  // Al cerrarse vuelve al principio: si no, la próxima vez se abriría
  // directamente en la segunda pregunta.
  useEffect(() => {
    if (!visible) setPaso(1);
  }, [visible]);

  const esSegundo = paso === 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <Pressable
        style={[styles.velo, { backgroundColor: colors.scrim }]}
        onPress={onCancelar}
        accessibilityLabel="Cerrar"
      />

      <View style={styles.contenedor} pointerEvents="box-none">
        <View
          style={[
            styles.hoja,
            shadow.raised,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.cardBorder,
              borderWidth: colors.cardBorderWidth,
            },
          ]}
        >
          <IconTile tamano={56} fondo={colors.dangerSoft}>
            <AlertTriangle size={26} strokeWidth={1.75} color={colors.danger} />
          </IconTile>

          <Text style={[typography.section, { color: colors.text }, styles.centro]}>
            {esSegundo ? (segundaPregunta as string) : titulo}
          </Text>

          {!esSegundo ? (
            <>
              <Text
                style={[typography.body, { color: colors.textSecondary }, styles.centro]}
              >
                {descripcion}
              </Text>

              {consecuencias?.length ? (
                <View
                  style={[styles.consecuencias, { backgroundColor: colors.surfaceSunken }]}
                >
                  {consecuencias.map((c) => (
                    <View key={c} style={styles.punto}>
                      <View style={[styles.bolita, { backgroundColor: colors.danger }]} />
                      <Text
                        style={[typography.caption, { color: colors.textSecondary }, styles.flexible]}
                      >
                        {c}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}

          <View style={styles.botones}>
            <Button
              label={esSegundo ? confirmar : segundaPregunta ? 'Continuar' : confirmar}
              variante="peligro"
              vibra
              onPress={() => {
                if (segundaPregunta && !esSegundo) {
                  avisarDestructivo();
                  setPaso(2);
                } else {
                  onConfirmar();
                }
              }}
            />
            <Button label="Cancelar" variante="texto" onPress={onCancelar} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  velo: { ...StyleSheet.absoluteFillObject },
  contenedor: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: layout.screenPaddingH,
  },
  hoja: {
    borderRadius: radius.sheet,
    padding: spacing.xxl,
    gap: spacing.md,
    alignItems: 'center',
  },
  centro: { textAlign: 'center' },
  consecuencias: {
    alignSelf: 'stretch',
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  punto: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  bolita: { width: 5, height: 5, borderRadius: 3, marginTop: 7 },
  flexible: { flex: 1 },
  botones: { alignSelf: 'stretch', gap: spacing.xs, paddingTop: spacing.sm },
});
