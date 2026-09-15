import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { t } from '@/lib/i18n';
import { Button, Saludo, Screen, TextField, spacing, typography, useTheme } from '@/ui';

export default function SignInScreen() {
  const { entrar } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function alEntrar() {
    setError(null);
    if (!email.trim()) return setError(t('auth.faltaEmail'));
    if (!password) return setError(t('auth.faltaPassword'));

    setCargando(true);
    const { error: fallo } = await entrar(email, password);
    setCargando(false);

    if (fallo) setError(fallo);
    else router.replace('/');
  }

  return (
    <Screen>
      <View style={styles.cabecera}>
        <Saludo mensaje={t('auth.nexiBienvenida')} tamano={128} />
        <Text style={[typography.title, { color: colors.text }, styles.centro]}>
          {t('auth.bienvenida')}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t('app.tagline')}</Text>
      </View>

      <View style={styles.formulario}>
        <TextField
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          inputMode="email"
        />
        <TextField
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          error={error}
          onSubmitEditing={alEntrar}
          returnKeyType="go"
        />

        <Button label={t('auth.signIn')} onPress={alEntrar} cargando={cargando} />

        <Link href="/(auth)/forgot-password" style={[typography.caption, styles.enlace, { color: colors.brand }]}>
          {t('auth.forgotPassword')}
        </Link>
      </View>

      <View style={styles.pie}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t('auth.noAccount')}</Text>
        <Link href="/(auth)/sign-up" style={[typography.bodyStrong, { color: colors.brand }]}>
          {t('auth.signUp')}
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cabecera: { alignItems: 'center', gap: spacing.xxs, paddingBottom: spacing.lg },
  centro: { textAlign: 'center' },
  formulario: { gap: spacing.lg },
  enlace: { textAlign: 'center', paddingVertical: spacing.sm },
  pie: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, paddingTop: spacing.xxl },
});
