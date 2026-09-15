import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';

import { manifiesto } from '@/modules/coolio';
import { t } from '@/lib/i18n';
import { Button, Screen, spacing, themeForModule, typography, useTheme } from '@/ui';

/**
 * Equipos: la portada del mundo Coolio.
 *
 * Aquí SÍ sale Airi, porque estamos dentro de su mundo. Y sale solo aquí:
 * una mascota por recorrido, así que las otras tres pestañas no la
 * repiten aunque también estén vacías.
 */
export default function EquiposScreen() {
  const { colors, scheme } = useTheme();
  const acento = themeForModule('coolio', scheme);

  return (
    <Screen>
      <View style={styles.caja}>
        <Image source={manifiesto.mascota} style={styles.airi} resizeMode="contain" />

        <Text style={[typography.section, { color: colors.text }, styles.centro]}>
          {t('coolio.vacioTitulo')}
        </Text>
        <Text
          style={[typography.body, { color: colors.textSecondary }, styles.centro, styles.ancho]}
        >
          {t('coolio.vacioTexto')}
        </Text>

        {/* El único botón del mundo vacío. No se repite en las otras tres
            pestañas: un vacío que insiste es una lista de deberes. */}
        <Button
          label={t('coolio.vacioBoton')}
          onPress={() => router.push('/coolio/anadir')}
          ancho={false}
          icono={<Plus size={18} strokeWidth={2} color={acento.onPrimary} />}
          style={{ backgroundColor: acento.primary, marginTop: spacing.md }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  caja: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xl },
  airi: { width: 120, height: 120 },
  centro: { textAlign: 'center' },
  ancho: { maxWidth: 320 },
});
