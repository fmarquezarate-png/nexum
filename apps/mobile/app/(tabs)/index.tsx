import { router, useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { listarCasas, type CasaConRol } from '@/core/homes';
import { t } from '@/lib/i18n';
import {
  Badge,
  EmptyState,
  ErrorState,
  Loading,
  Screen,
  layout,
  spacing,
  typography,
  useTheme,
} from '@/ui';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; casas: CasaConRol[] }
  | { tipo: 'error' };

/**
 * Inicio.
 *
 * El protagonista es el saludo y, debajo, los dispositivos. La casa
 * activa vive AQUÍ, en la cabecera, no escondida dentro de la pestaña de
 * Dispositivos: es el contexto de todo lo que se ve en la app.
 */
export default function HomeScreen() {
  const { perfil } = useAuth();
  const { colors } = useTheme();
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const cargar = useCallback(() => {
    listarCasas()
      .then((casas) => setEstado({ tipo: 'listo', casas }))
      .catch(() => setEstado({ tipo: 'error' }));
  }, []);

  useFocusEffect(cargar);

  const nombre = perfil?.display_name?.split(' ')[0];

  return (
    <Screen>
      <View style={styles.cabecera}>
        <Text style={[typography.display, { color: colors.text }]}>
          {nombre ? t('inicio.saludo', { name: nombre }) : t('inicio.sinNombre')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {t('inicio.subtitulo')}
        </Text>
      </View>

      {estado.tipo === 'listo' && estado.casas.length > 0 ? (
        <View style={styles.casas}>
          {estado.casas.map((c) => (
            <Badge key={c.id} texto={c.name} tono="marca" />
          ))}
        </View>
      ) : null}

      <View style={styles.seccion}>
        <Text style={[typography.section, { color: colors.text }]}>
          {t('inicio.misDispositivos')}
        </Text>
      </View>

      {estado.tipo === 'cargando' ? (
        <Loading />
      ) : estado.tipo === 'error' ? (
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          onReintentar={cargar}
        />
      ) : (
        <EmptyState
          quien="nexi"
          titulo={t('inicio.sinDispositivosTitulo')}
          descripcion={t('inicio.sinDispositivosTexto')}
          accion={{
            label: t('dispositivos.anadir'),
            onPress: () => router.push('/(tabs)/devices'),
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  cabecera: { gap: spacing.xxs, paddingBottom: spacing.sm },
  casas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  seccion: { paddingTop: layout.sectionGap - layout.cardGap },
});
