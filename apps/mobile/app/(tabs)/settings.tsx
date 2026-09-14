import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { t } from '@/lib/i18n';
import { Button, Card, Divider, ListRow, Placeholder, Screen, colors, typography } from '@/ui';

export default function SettingsScreen() {
  const { perfil, session, salir } = useAuth();

  async function alSalir() {
    await salir();
    router.replace('/(auth)/sign-in');
  }

  return (
    <Screen title={t('tabs.settings')}>
      <Card>
        <ListRow
          titulo={perfil?.display_name ?? t('ajustes.perfil')}
          subtitulo={session?.user.email ?? undefined}
          onPress={() => router.push('/perfil')}
          derecha={<Text style={{ color: colors.textFaint }}>›</Text>}
        />
      </Card>

      <Card>
        <ListRow
          titulo={t('ajustes.casas')}
          onPress={() => router.push('/casas')}
          derecha={<Text style={{ color: colors.textFaint }}>›</Text>}
        />
        <Divider />
        <ListRow
          titulo={t('ajustes.tengoCodigo')}
          subtitulo={t('codigos.canjearExplicacion')}
          onPress={() => router.push('/canjear')}
          derecha={<Text style={{ color: colors.textFaint }}>›</Text>}
        />
      </Card>

      <Placeholder phase="Fase 2" what="Dispositivos" />
      <Placeholder phase="Fase 3" what="Notificaciones" />

      <View style={{ paddingTop: 8 }}>
        <Button label={t('auth.salir')} variante="peligro" onPress={alSalir} />
      </View>

      <Text style={[typography.caption, { color: colors.textFaint, textAlign: 'center' }]}>
        {t('ajustes.version', { v: '0.1.0' })}
      </Text>
    </Screen>
  );
}
