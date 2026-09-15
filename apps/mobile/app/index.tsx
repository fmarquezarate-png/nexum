import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { listarCasas } from '@/core/homes';
import { t } from '@/lib/i18n';
import { Button, ErrorState, Loading, layout, useTheme } from '@/ui';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; tieneCasa: boolean; omitido: boolean }
  | { tipo: 'error' };

/** Si el usuario salió del asistente a propósito, no se le vuelve a meter. */
const CLAVE_OMITIDO = 'nexum.onboarding.omitido';

/**
 * Pantalla de entrada. Decide a dónde va cada uno:
 *
 *   sin sesión           → (auth)/sign-in
 *   con sesión, 0 casas  → onboarding
 *   con sesión, ≥1 casa  → (tabs)
 *
 * ⚠ El estado de error es imprescindible. Antes, si fallaba la red, se
 * daba por hecho que el usuario no tenía casas y se le mandaba al
 * asistente de alta, donde se le invitaba a crear una casa que ya tenía.
 * Un fallo de conexión no puede parecerse a una cuenta vacía.
 */
export default function Index() {
  const { session, cargando } = useAuth();
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const comprobar = useCallback(() => {
    setEstado({ tipo: 'cargando' });
    Promise.all([listarCasas(), AsyncStorage.getItem(CLAVE_OMITIDO).catch(() => null)])
      .then(([casas, omitido]) =>
        setEstado({ tipo: 'listo', tieneCasa: casas.length > 0, omitido: omitido === '1' }),
      )
      .catch(() => setEstado({ tipo: 'error' }));
  }, []);

  useEffect(() => {
    if (cargando || !session) return;
    comprobar();
  }, [session, cargando, comprobar]);

  if (cargando) return <Centro><Loading /></Centro>;
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  if (estado.tipo === 'error') {
    return (
      <Centro>
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          onReintentar={comprobar}
        />
      </Centro>
    );
  }

  if (estado.tipo === 'cargando') return <Centro><Loading texto={t('app.cargando')} /></Centro>;

  const alAsistente = !estado.tieneCasa && !estado.omitido;
  return <Redirect href={alAsistente ? '/onboarding' : '/(tabs)'} />;
}

function Centro({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.centro, { backgroundColor: colors.canvas }]}>{children}</View>;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
  },
});
