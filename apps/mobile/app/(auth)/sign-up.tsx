import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { t } from '@/lib/i18n';
import { Button, Saludo, Screen, TextField, colors, spacing, typography } from '@/ui';

export default function SignUpScreen() {
  const { registrarse } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function alRegistrarse() {
    setError(null);
    if (!nombre.trim()) return setError(t('auth.faltaNombre'));
    if (!email.trim()) return setError(t('auth.faltaEmail'));
    if (password.length < 6) return setError(t('auth.passwordCorta'));

    setCargando(true);
    const { error: fallo } = await registrarse(email, password, nombre);
    setCargando(false);

    // Sin confirmación por correo: al registrarse ya hay sesión, así que
    // la pantalla de entrada le manda directo al asistente de alta.
    if (fallo) setError(fallo);
    else router.replace('/');
  }

  return (
    <Screen title={t('auth.signUp')}>
      <Saludo mensaje={t('auth.nexiRegistro')} tamano={120} />

      <View style={styles.formulario}>
        <TextField
          label={t('auth.nombre')}
          placeholder={t('auth.nombrePlaceholder')}
          value={nombre}
          onChangeText={setNombre}
          autoComplete="name"
        />
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
          ayuda={t('auth.passwordAyuda')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={error}
        />

        <Button label={t('auth.signUp')} onPress={alRegistrarse} cargando={cargando} />
      </View>

      <View style={styles.pie}>
        <Text style={styles.pieTexto}>{t('auth.hasAccount')}</Text>
        <Link href="/(auth)/sign-in" style={styles.enlaceFuerte}>
          {t('auth.signIn')}
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formulario: { gap: spacing.lg },
  pie: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, paddingTop: spacing.xl },
  pieTexto: { ...typography.body, color: colors.textMuted },
  enlaceFuerte: { ...typography.bodyStrong, color: colors.brand },
});
