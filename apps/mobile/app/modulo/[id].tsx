import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { modulo } from '@/modules/registry';
import { t } from '@/lib/i18n';
import {
  Badge,
  Burbuja,
  Card,
  ErrorState,
  Screen,
  spacing,
  themeForModule,
  typography,
  useTheme,
} from '@/ui';

/**
 * Ficha de un módulo que todavía no existe.
 *
 * Genérica: se alimenta del manifiesto, así que sirve igual para Plantico
 * hoy que para Iluminación mañana, sin tocar este archivo.
 *
 * Aquí SÍ sale la mascota del módulo, por excepción explícita: esta ficha
 * es la presentación de ese mundo, no una pantalla de Nexum haciendo su
 * trabajo. Es el único sitio fuera de su mundo donde se le deja salir.
 */
export default function FichaModuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, scheme } = useTheme();

  const m = modulo(id ?? '');
  if (!m) {
    return (
      <Screen>
        <ErrorState titulo="Esta app no existe" detalle="Puede que el enlace esté mal." />
      </Screen>
    );
  }

  const acento = themeForModule(m.id, scheme);

  return (
    <Screen>
      <View style={styles.cabecera}>
        <Image source={m.logo} style={styles.logo} resizeMode="contain" />
        <Text style={[typography.title, { color: colors.text }]}>{m.nombre}</Text>
        <Text style={[typography.body, { color: colors.textSecondary }, styles.centro]}>
          {m.tagline}
        </Text>
        <Badge texto={t('proximamente.etiqueta').toUpperCase()} tono="marca" />
      </View>

      {m.mascota ? (
        <View style={styles.presentacion}>
          <Burbuja>{t(`modulo.${m.id}.mensaje`)}</Burbuja>
          <Image source={m.mascota} style={styles.mascota} resizeMode="contain" />
        </View>
      ) : null}

      <Card>
        <Text style={[typography.cardTitle, { color: colors.text }]}>
          {t(`modulo.${m.id}.queHara`)}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {t(`modulo.${m.id}.detalle`)}
        </Text>
      </Card>

      <Text style={[typography.caption, { color: colors.textFaint }, styles.centro]}>
        {t('modulo.avisoLlegada')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cabecera: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  logo: { width: 72, height: 72, borderRadius: 18 },
  centro: { textAlign: 'center' },
  presentacion: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  mascota: { width: 130, height: 130 },
});
