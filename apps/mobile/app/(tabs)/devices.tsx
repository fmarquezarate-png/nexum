import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { listarCasas, type CasaConRol } from '@/core/homes';
import { t } from '@/lib/i18n';
import { EmptyState, HIT_TARGET, Screen, colors, radius, spacing, typography } from '@/ui';

/**
 * Dispositivos, agrupados por casa y habitación.
 *
 * Arriba el selector de casa ("Mi Casa / Casa Ana" del mockup). La lista
 * de aparatos llega en la fase 2: ahora mismo siempre está vacía porque
 * todavía no se puede emparejar nada.
 */
export default function DevicesScreen() {
  const [casas, setCasas] = useState<CasaConRol[] | null>(null);
  const [activa, setActiva] = useState<string | null>(null);

  const cargar = useCallback(() => {
    listarCasas()
      .then((cs) => {
        setCasas(cs);
        setActiva((prev) => prev ?? cs[0]?.id ?? null);
      })
      .catch(() => setCasas([]));
  }, []);

  useFocusEffect(cargar);

  if (casas === null) {
    return (
      <Screen title={t('tabs.devices')}>
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  if (casas.length === 0) {
    return (
      <Screen title={t('tabs.devices')}>
        <EmptyState
          titulo={t('casas.vaciaTitulo')}
          descripcion={t('casas.vaciaTexto')}
          accion={{ label: t('casas.crear'), onPress: () => router.push('/casas') }}
        />
      </Screen>
    );
  }

  return (
    <Screen title={t('tabs.devices')}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selector}
      >
        {casas.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setActiva(c.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: c.id === activa }}
            style={({ pressed }) => [
              styles.pastilla,
              c.id === activa && styles.pastillaActiva,
              pressed && styles.pulsada,
            ]}
          >
            <Text style={[styles.pastillaTexto, c.id === activa && styles.pastillaTextoActivo]}>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <EmptyState
        titulo={t('dispositivos.vacioTitulo')}
        descripcion={t('dispositivos.vacioTexto')}
        accion={{ label: t('dispositivos.anadir'), onPress: () => router.push('/onboarding') }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  selector: { gap: spacing.sm, paddingVertical: spacing.sm, paddingRight: spacing.lg },
  pastilla: {
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pastillaActiva: { backgroundColor: colors.brand, borderColor: colors.brand },
  pulsada: { opacity: 0.7 },
  pastillaTexto: { ...typography.body, color: colors.text },
  pastillaTextoActivo: { color: colors.textOnBrand, fontWeight: '600' },
});
