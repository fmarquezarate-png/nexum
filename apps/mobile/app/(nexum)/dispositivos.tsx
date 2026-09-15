import { router, useFocusEffect } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { listarCasas, type CasaConRol } from '@/core/homes';
import { mensajeDe } from '@/lib/errores';
import { t } from '@/lib/i18n';
import {
  Button,
  EmptyState,
  ErrorState,
  Loading,
  PressableAnimado,
  Screen,
  layout,
  radius,
  spacing,
  typography,
  useTheme,
  usePressScale,
} from '@/ui';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; casas: CasaConRol[] }
  | { tipo: 'error'; motivo: string };

/**
 * Dispositivos, agrupados por casa y habitación.
 *
 * La lista de aparatos llega en la fase 2: hasta que se pueda emparejar
 * un ESP32 siempre estará vacía, y eso hay que decirlo sin que parezca
 * un fallo.
 */
export default function DevicesScreen() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [activa, setActiva] = useState<string | null>(null);

  const cargar = useCallback(() => {
    listarCasas()
      .then((casas) => {
        setEstado({ tipo: 'listo', casas });
        setActiva((prev) => prev ?? casas[0]?.id ?? null);
      })
      .catch((fallo) => setEstado({ tipo: 'error', motivo: mensajeDe(fallo) }));
  }, []);

  useFocusEffect(cargar);

  if (estado.tipo === 'cargando') {
    return (
      <Screen title={t('tabs.devices')}>
        <Loading />
      </Screen>
    );
  }

  if (estado.tipo === 'error') {
    return (
      <Screen title={t('tabs.devices')}>
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          tecnico={estado.motivo}
          onReintentar={cargar}
        />
      </Screen>
    );
  }

  if (estado.casas.length === 0) {
    return (
      <Screen title={t('tabs.devices')}>
        <EmptyState
          quien="nexi"
          titulo={t('casas.vaciaTitulo')}
          descripcion={t('casas.vaciaTexto')}
          accion={{ label: t('casas.crear'), onPress: () => router.push('/casas') }}
        />
      </Screen>
    );
  }

  return (
    <Screen title={t('tabs.devices')}>
      {estado.casas.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selector}
        >
          {estado.casas.map((c) => (
            <Pastilla
              key={c.id}
              texto={c.name}
              activa={c.id === activa}
              onPress={() => setActiva(c.id)}
            />
          ))}
        </ScrollView>
      ) : null}

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

function Pastilla({
  texto,
  activa,
  onPress,
}: {
  texto: string;
  activa: boolean;
  onPress: () => void;
}) {
  const { colors, shadow } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="tab"
      accessibilityState={{ selected: activa }}
      style={[
        styles.pastilla,
        {
          backgroundColor: activa ? colors.brandFill : colors.surface,
          borderColor: activa ? colors.brandFill : colors.borderStrong,
        },
        !activa && shadow.subtle,
        animatedStyle,
      ]}
    >
      <Text
        style={[
          typography.captionStrong,
          { color: activa ? colors.textOnFill : colors.textSecondary },
        ]}
      >
        {texto}
      </Text>
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  selector: { gap: spacing.sm, paddingVertical: spacing.xs, paddingRight: layout.screenPaddingH },
  pastilla: {
    minHeight: layout.hitTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
