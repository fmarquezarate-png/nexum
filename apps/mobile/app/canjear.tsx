import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { canjearCodigo } from '@/core/access';
import { fechaLarga } from '@/lib/format';
import { t } from '@/lib/i18n';
import {
  Button,
  Card,
  Saludo,
  Screen,
  TextField,
  spacing,
  typography,
  useAviso,
  useTheme,
} from '@/ui';

/**
 * Canje de un código de invitado.
 *
 * Cada motivo de rechazo tiene su propio mensaje: caducado, desactivado,
 * sin usos, inexistente. Nunca un "ha ocurrido un error" genérico: es un
 * criterio de aceptación de esta fase.
 */
export default function CanjearScreen() {
  const { colors } = useTheme();
  const { avisarExito } = useAviso();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function canjear() {
    setError(null);
    const limpio = codigo.trim();
    if (!limpio) return setError(t('errores.not_found'));

    setCargando(true);
    try {
      const r = await canjearCodigo(limpio);
      if (r.ok) {
        setExito(t('codigos.canjeOkCaduca', { fecha: fechaLarga(r.datos.expires_at) }));
        avisarExito(t('codigos.canjeOk'));
      } else {
        setError(t(`errores.${r.motivo}`));
      }
    } catch {
      setError(t('errores.sinConexion'));
    } finally {
      setCargando(false);
    }
  }

  if (exito) {
    return (
      <Screen title={t('codigos.canjeOk')}>
        <Saludo mensaje={exito} quien="nexi" />
        <Button label={t('acciones.continuar')} onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('codigos.canjearTitulo')} subtitle={t('codigos.canjearExplicacion')}>
      <View style={styles.formulario}>
        <TextField
          label={t('codigos.canjearLabel')}
          placeholder={t('codigos.canjearPlaceholder')}
          value={codigo}
          onChangeText={(v) => setCodigo(v.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect={false}
          error={error}
          onSubmitEditing={canjear}
          returnKeyType="go"
          autoFocus
        />
        <Button label={t('codigos.canjearBoton')} onPress={canjear} cargando={cargando} vibra />
      </View>

      <Card>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {t('codigos.explicacion')}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formulario: { gap: spacing.lg },
});
