import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { crearCasa, crearHabitaciones } from '@/core/homes';
import { t } from '@/lib/i18n';
import {
  Button,
  HIT_TARGET,
  Saludo,
  Screen,
  TextField,
  colors,
  radius,
  spacing,
  typography,
} from '@/ui';

/** Habitaciones que se ofrecen de entrada. Se puede añadir cualquier otra. */
const SUGERENCIAS = ['salon', 'dormitorio', 'cocina', 'despacho', 'bano', 'terraza'] as const;

const TOTAL_PASOS = 3;

/**
 * Asistente de alta.
 *
 * Tres pasos: nombre de la casa, habitaciones y primer dispositivo.
 * La casa se crea al final del paso 1, así que si alguien se sale a
 * mitad no se queda sin nada: su casa ya existe.
 */
export default function OnboardingScreen() {
  const [paso, setPaso] = useState(1);
  const [nombreCasa, setNombreCasa] = useState('');
  const [homeId, setHomeId] = useState<string | null>(null);
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [otra, setOtra] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function crearYSeguir() {
    setError(null);
    setCargando(true);
    try {
      const casa = await crearCasa(nombreCasa.trim() || t('onboarding.casaPlaceholder'));
      setHomeId(casa.id);
      setPaso(2);
    } catch {
      setError(t('onboarding.errorCrear'));
    } finally {
      setCargando(false);
    }
  }

  async function guardarHabitaciones() {
    setCargando(true);
    try {
      if (homeId && elegidas.length > 0) await crearHabitaciones(homeId, elegidas);
      setPaso(3);
    } catch {
      // Las habitaciones no son imprescindibles: si fallan, se sigue.
      setPaso(3);
    } finally {
      setCargando(false);
    }
  }

  function alternar(nombre: string) {
    setElegidas((prev) =>
      prev.includes(nombre) ? prev.filter((x) => x !== nombre) : [...prev, nombre],
    );
  }

  function anadirOtra() {
    const n = otra.trim();
    if (!n) return;
    if (!elegidas.includes(n)) setElegidas((prev) => [...prev, n]);
    setOtra('');
  }

  return (
    <Screen>
      <Progreso paso={paso} />

      {paso === 1 && (
        <>
          <Saludo mensaje={t('onboarding.casaNexi')} />
          <Text style={styles.pregunta}>{t('onboarding.casaTitulo')}</Text>
          <TextField
            label={t('onboarding.casaLabel')}
            placeholder={t('onboarding.casaPlaceholder')}
            ayuda={t('onboarding.casaAyuda')}
            value={nombreCasa}
            onChangeText={setNombreCasa}
            error={error}
            onSubmitEditing={crearYSeguir}
            returnKeyType="next"
          />
          <Button
            label={cargando ? t('onboarding.creando') : t('acciones.continuar')}
            onPress={crearYSeguir}
            cargando={cargando}
          />
        </>
      )}

      {paso === 2 && (
        <>
          <Saludo mensaje={t('onboarding.habitacionesNexi')} tamano={110} />
          <Text style={styles.pregunta}>{t('onboarding.habitacionesTitulo')}</Text>

          <View style={styles.fichas}>
            {SUGERENCIAS.map((clave) => {
              const nombre = t(`habitaciones.${clave}`);
              return (
                <Ficha
                  key={clave}
                  texto={nombre}
                  activa={elegidas.includes(nombre)}
                  onPress={() => alternar(nombre)}
                />
              );
            })}
            {elegidas
              .filter((n) => !SUGERENCIAS.some((s) => t(`habitaciones.${s}`) === n))
              .map((n) => (
                <Ficha key={n} texto={n} activa onPress={() => alternar(n)} />
              ))}
          </View>

          <TextField
            label={t('onboarding.habitacionOtra')}
            placeholder={t('onboarding.habitacionNueva')}
            value={otra}
            onChangeText={setOtra}
            onSubmitEditing={anadirOtra}
            returnKeyType="done"
          />

          <Button
            label={t('acciones.continuar')}
            onPress={guardarHabitaciones}
            cargando={cargando}
          />
          <Button
            label={t('acciones.saltar')}
            onPress={() => setPaso(3)}
            variante="texto"
          />
        </>
      )}

      {paso === 3 && (
        <>
          <Saludo mensaje={t('onboarding.dispositivoNexi')} />
          <Text style={styles.pregunta}>{t('onboarding.dispositivoTitulo')}</Text>
          <Button
            label={t('onboarding.dispositivoAhora')}
            onPress={() => router.replace('/(tabs)/devices')}
          />
          <Button
            label={t('acciones.masTarde')}
            variante="secundario"
            onPress={() => router.replace('/(tabs)')}
          />
        </>
      )}
    </Screen>
  );
}

function Progreso({ paso }: { paso: number }) {
  return (
    <View style={styles.progreso}>
      <Text style={styles.progresoTexto}>
        {t('onboarding.paso', { n: paso, total: TOTAL_PASOS })}
      </Text>
      <View style={styles.barra}>
        {Array.from({ length: TOTAL_PASOS }, (_, i) => (
          <View key={i} style={[styles.tramo, i < paso && styles.tramoHecho]} />
        ))}
      </View>
    </View>
  );
}

function Ficha({
  texto,
  activa,
  onPress,
}: {
  texto: string;
  activa: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: activa }}
      style={({ pressed }) => [styles.ficha, activa && styles.fichaActiva, pressed && styles.pulsada]}
    >
      <Text style={[styles.fichaTexto, activa && styles.fichaTextoActiva]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  progreso: { gap: spacing.sm, paddingTop: spacing.sm },
  progresoTexto: { ...typography.label, color: colors.textMuted },
  barra: { flexDirection: 'row', gap: spacing.xs },
  tramo: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  tramoHecho: { backgroundColor: colors.brand },
  pregunta: { ...typography.title, color: colors.text },
  fichas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ficha: {
    minHeight: HIT_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fichaActiva: { backgroundColor: colors.brand, borderColor: colors.brand },
  pulsada: { opacity: 0.7 },
  fichaTexto: { ...typography.body, color: colors.text },
  fichaTextoActiva: { color: colors.textOnBrand, fontWeight: '600' },
});
