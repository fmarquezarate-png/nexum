import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ArrowLeft, Plus, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { crearCasa, crearHabitaciones } from '@/core/homes';
import { t } from '@/lib/i18n';
import {
  Button,
  ConfirmSheet,
  PressableAnimado,
  Saludo,
  Screen,
  TextField,
  layout,
  radius,
  spacing,
  typography,
  useAviso,
  usePressScale,
  useTheme,
} from '@/ui';

const SUGERENCIAS = ['salon', 'dormitorio', 'cocina', 'despacho', 'bano', 'terraza'] as const;
const TOTAL = 3;

/** Recuerda que el usuario prefirió no crear casa ahora. Lo lee app/index.tsx. */
export const CLAVE_OMITIDO = 'nexum.onboarding.omitido';

/**
 * Asistente de alta.
 *
 * La casa se crea AL FINAL, no en el primer paso. Antes se creaba nada
 * más escribir el nombre, así que un nombre mal escrito quedaba grabado
 * y no había forma de volver atrás. Ahora los dos primeros pasos solo
 * recogen datos y se puede retroceder y corregir.
 */
export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { avisarExito } = useAviso();

  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [nombreCasa, setNombreCasa] = useState('');
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [otra, setOtra] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [casaCreada, setCasaCreada] = useState<string | null>(null);

  const nombreFinal = nombreCasa.trim() || t('onboarding.casaPlaceholder');

  async function crearTodo() {
    setError(null);
    setCargando(true);
    try {
      const casa = await crearCasa(nombreFinal);
      if (elegidas.length) {
        // Si fallan las habitaciones NO se avanza en silencio: la casa
        // ya existe, así que se avisa y se sigue; se pueden añadir luego.
        await crearHabitaciones(casa.id, elegidas).catch(() => {});
      }
      setCasaCreada(casa.name);
      avisarExito(t('casas.creada'));
      setPaso(3);
    } catch (fallo) {
      const bruto = fallo instanceof Error ? fallo.message : String(fallo);
      const traducido = t(`errores.${bruto}`);
      setError(
        traducido === `errores.${bruto}`
          ? t('onboarding.errorCrearDetalle', { detalle: bruto })
          : traducido,
      );
      setPaso(2);
    } finally {
      setCargando(false);
    }
  }

  async function salir() {
    await AsyncStorage.setItem(CLAVE_OMITIDO, '1').catch(() => {});
    router.replace('/(tabs)');
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
      <View style={styles.barra}>
        {paso > 1 && paso < 3 ? (
          <BotonBarra etiqueta={t('acciones.atras')} onPress={() => setPaso(1)}>
            <ArrowLeft size={20} strokeWidth={1.75} color={colors.textSecondary} />
          </BotonBarra>
        ) : (
          <View style={styles.hueco} />
        )}

        <Text style={[typography.label, { color: colors.textMuted }]}>
          {t('onboarding.paso', { n: paso, total: TOTAL }).toUpperCase()}
        </Text>

        {paso < 3 ? (
          <BotonBarra etiqueta={t('onboarding.salir')} onPress={() => setSaliendo(true)}>
            <X size={20} strokeWidth={1.75} color={colors.textSecondary} />
          </BotonBarra>
        ) : (
          <View style={styles.hueco} />
        )}
      </View>

      <View style={styles.progreso}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <View
            key={i}
            style={[
              styles.tramo,
              { backgroundColor: i < paso ? colors.brand : colors.surfaceSunken },
            ]}
          />
        ))}
      </View>

      {paso === 1 && (
        <>
          <Saludo mensaje={t('onboarding.casaNexi')} tamano={132} />
          <Text style={[typography.title, { color: colors.text }]}>
            {t('onboarding.casaTitulo')}
          </Text>
          <TextField
            label={t('onboarding.casaLabel')}
            placeholder={t('onboarding.casaPlaceholder')}
            ayuda={t('onboarding.casaAyuda')}
            value={nombreCasa}
            onChangeText={setNombreCasa}
            onSubmitEditing={() => setPaso(2)}
            returnKeyType="next"
          />
          <Button label={t('acciones.continuar')} onPress={() => setPaso(2)} />
        </>
      )}

      {paso === 2 && (
        <>
          <Saludo mensaje={t('onboarding.habitacionesNexi')} tamano={110} />
          <Text style={[typography.title, { color: colors.text }]}>
            {t('onboarding.habitacionesTitulo')}
          </Text>

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
            error={error}
          />

          <Button
            label={cargando ? t('onboarding.creando') : t('acciones.continuar')}
            onPress={crearTodo}
            cargando={cargando}
            vibra
          />
          <Button label={t('acciones.saltar')} variante="texto" onPress={crearTodo} />
        </>
      )}

      {paso === 3 && (
        <>
          <Saludo
            mensaje={t('onboarding.resumenNexi', { casa: casaCreada ?? nombreFinal })}
            tamano={140}
          />
          <Text style={[typography.title, { color: colors.text }, styles.centro]}>
            {t('onboarding.resumenTitulo')}
          </Text>
          <Button
            label={t('onboarding.dispositivoAhora')}
            icono={<Plus size={18} strokeWidth={2} color={colors.textOnFill} />}
            onPress={() => router.replace('/(tabs)/devices')}
          />
          <Button
            label={t('acciones.masTarde')}
            variante="secundario"
            onPress={() => router.replace('/(tabs)')}
          />
        </>
      )}

      <ConfirmSheet
        visible={saliendo}
        titulo={t('onboarding.salirTitulo')}
        descripcion={t('onboarding.salirTexto')}
        confirmar={t('onboarding.salirConfirmar')}
        onConfirmar={salir}
        onCancelar={() => setSaliendo(false)}
      />
    </Screen>
  );
}

function BotonBarra({
  children,
  onPress,
  etiqueta,
}: {
  children: React.ReactNode;
  onPress: () => void;
  etiqueta: string;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.9);
  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={10}
      style={[styles.botonBarra, animatedStyle]}
    >
      {children}
    </PressableAnimado>
  );
}

function Ficha({ texto, activa, onPress }: { texto: string; activa: boolean; onPress: () => void }) {
  const { colors, shadow } = useTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: activa }}
      style={[
        styles.ficha,
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
          typography.bodyStrong,
          { color: activa ? colors.textOnFill : colors.textSecondary },
        ]}
      >
        {texto}
      </Text>
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  barra: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hueco: { width: 36 },
  botonBarra: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  progreso: { flexDirection: 'row', gap: spacing.xs, paddingBottom: spacing.sm },
  tramo: { flex: 1, height: 4, borderRadius: 2 },
  centro: { textAlign: 'center' },
  fichas: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ficha: {
    minHeight: layout.hitTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
