import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { SelectorCasa, useCasaActiva } from '@/core/homes';
import { t } from '@/lib/i18n';
import { Button, EmptyState, ErrorState, EsqueletoLista, Screen, spacing } from '@/ui';

/**
 * Dispositivos de la casa activa.
 *
 * La casa la manda el provider, igual que en Inicio: aquí no se elige
 * una casa "para esta pantalla". El selector es el mismo control y
 * cambia la casa de toda la app.
 *
 * La lista de aparatos llega en la fase 2: hasta que se pueda emparejar
 * un ESP32 siempre estará vacía, y eso hay que decirlo sin que parezca
 * un fallo.
 */
export default function DevicesScreen() {
  const { casas, activa, cargando, error, recargar } = useCasaActiva();

  if (cargando) {
    return (
      <Screen title={t('tabs.devices')}>
        <EsqueletoLista filas={3} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title={t('tabs.devices')}>
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          tecnico={error}
          onReintentar={recargar}
        />
      </Screen>
    );
  }

  if (casas.length === 0 || !activa) {
    return (
      <Screen title={t('tabs.devices')}>
        <EmptyState
          quien="nexi"
          titulo={t('casas.vaciaTitulo')}
          descripcion={t('casas.vaciaTexto')}
          accion={{
            label: t('casas.crear'),
            onPress: () => router.push('/casas'),
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen title={t('tabs.devices')}>
      <View style={styles.selector}>
        <SelectorCasa />
      </View>

      <EmptyState
        quien="nexi"
        titulo={t('dispositivos.vacioTitulo')}
        descripcion={t('dispositivos.vacioTexto')}
      />

      <Button
        label={t('dispositivos.anadir')}
        variante="secundario"
        onPress={() => router.push('/anadir-dispositivo')}
        icono={<Plus size={18} strokeWidth={2} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  selector: { paddingBottom: spacing.xs },
});
