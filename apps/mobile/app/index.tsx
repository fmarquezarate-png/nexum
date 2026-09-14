import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { listarCasas } from '@/core/homes';
import { colors } from '@/ui';

/**
 * Pantalla de entrada. Decide a dónde va cada uno:
 *
 *   sin sesión        → (auth)/sign-in
 *   con sesión, 0 casas → onboarding  (el asistente de alta)
 *   con sesión, ≥1 casa → (tabs)
 *
 * Mientras lo averigua, enseña una ruedecita: si redirigiera antes de
 * saberlo, se vería un parpadeo feo entre pantallas.
 */
export default function Index() {
  const { session, cargando } = useAuth();
  const [tieneCasa, setTieneCasa] = useState<boolean | null>(null);

  useEffect(() => {
    if (cargando) return;
    if (!session) {
      setTieneCasa(null);
      return;
    }
    let vivo = true;
    listarCasas()
      .then((casas) => vivo && setTieneCasa(casas.length > 0))
      .catch(() => vivo && setTieneCasa(false));
    return () => {
      vivo = false;
    };
  }, [session, cargando]);

  if (cargando) return <Espera />;
  if (!session) return <Redirect href="/(auth)/sign-in" />;
  if (tieneCasa === null) return <Espera />;
  return <Redirect href={tieneCasa ? '/(tabs)' : '/onboarding'} />;
}

function Espera() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator color={colors.brand} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
