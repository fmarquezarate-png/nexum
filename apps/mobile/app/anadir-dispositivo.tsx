import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { MODULOS } from '@/modules/registry';
import { t } from '@/lib/i18n';
import {
  Badge,
  Card,
  Divider,
  ListRow,
  Screen,
  spacing,
  typography,
  useTheme,
} from '@/ui';

/**
 * "¿Qué quieres añadir?"
 *
 * Existe porque el emparejado pertenece a cada oficio: conectar un aire
 * no se parece en nada a conectar una bomba de riego. Aquí se elige la
 * app y a partir de ahí manda su mundo.
 *
 * Se alimenta del manifiesto: cuando llegue Iluminación aparecerá sola.
 */
export default function AnadirDispositivoScreen() {
  const { colors } = useTheme();

  return (
    <Screen title={t('anadirDispositivo.titulo')} subtitle={t('anadirDispositivo.texto')}>
      <Card>
        {MODULOS.map((m, i) => (
          <View key={m.id}>
            {i > 0 && <Divider />}
            <ListRow
              titulo={m.nombre}
              subtitulo={m.tagline}
              izquierda={<Image source={m.logo} style={styles.logo} resizeMode="contain" />}
              derecha={
                m.estado === 'proximamente' ? (
                  <Badge texto={t('proximamente.etiqueta').toUpperCase()} />
                ) : undefined
              }
              onPress={() =>
                router.push(
                  m.estado === 'disponible' ? `${m.ruta}/anadir` : `/modulo/${m.id}`,
                )
              }
            />
          </View>
        ))}
      </Card>

      <Text style={[typography.caption, { color: colors.textFaint }, styles.nota]}>
        {t('anadirDispositivo.nota')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { width: 40, height: 40, borderRadius: 12 },
  nota: { textAlign: 'center', paddingTop: spacing.sm },
});
