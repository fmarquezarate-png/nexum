import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { canjearCodigo } from '@/core/access';
import { fechaLarga } from '@/lib/format';
import { t } from '@/lib/i18n';
import { Button, Card, Mascota, Screen, TextField, colors, spacing, typography } from '@/ui';

/**
 * Canje de un código de invitado.
 *
 * Cada motivo de rechazo tiene su propio mensaje: caducado, desactivado,
 * sin usos, inexistente. Nunca un "ha ocurrido un error" genérico: es un
 * criterio de aceptación de esta fase.
 */
export default function CanjearScreen() {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function canjear() {
    setError(null);
    setExito(null);

    const limpio = codigo.trim();
    if (!limpio) return setError(t('errores.not_found'));

    setCargando(true);
    try {
      const r = await canjearCodigo(limpio);
      if (r.ok) {
        setExito(t('codigos.canjeOkCaduca', { fecha: fechaLarga(r.datos.expires_at) }));
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
        <Mascota quien="nexi" mensaje={exito} />
        <Button label={t('acciones.continuar')} onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('codigos.canjearTitulo')} subtitle={t('codigos.canjearExplicacion')}>
      <View style={{ gap: spacing.lg }}>
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
        />
        <Button label={t('codigos.canjearBoton')} onPress={canjear} cargando={cargando} />
      </View>

      <Card>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {t('codigos.explicacion')}
        </Text>
      </Card>
    </Screen>
  );
}
