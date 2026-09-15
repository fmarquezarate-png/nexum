import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { t } from '@/lib/i18n';
import { Button, Card, Screen, TextField, spacing, typography, useTheme } from '@/ui';

export default function ForgotPasswordScreen() {
  const { recuperarPassword } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  async function alEnviar() {
    setError(null);
    if (!email.trim()) return setError(t('auth.faltaEmail'));

    setCargando(true);
    const { error: fallo } = await recuperarPassword(email);
    setCargando(false);

    if (fallo) setError(fallo);
    else setEnviado(true);
  }

  return (
    <Screen title={t('auth.recuperarTitulo')} subtitle={t('auth.recuperarExplicacion')}>
      {enviado ? (
        <Card>
          <Text style={[typography.body, { color: colors.text }]}>
            {t('auth.recuperarEnviado')}
          </Text>
        </Card>
      ) : (
        <View style={styles.formulario}>
          <TextField
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            inputMode="email"
            error={error}
          />
          <Button label={t('acciones.continuar')} onPress={alEnviar} cargando={cargando} />
        </View>
      )}

      <Link
        href="/(auth)/sign-in"
        style={[typography.bodyStrong, styles.enlace, { color: colors.brand }]}
      >
        {t('acciones.volver')}
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formulario: { gap: spacing.lg },
  enlace: { textAlign: 'center', paddingVertical: spacing.lg },
});
