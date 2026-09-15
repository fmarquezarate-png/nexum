import { router } from 'expo-router';
import { KeyRound, LogOut, Moon, Home as IconoCasa, User } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { t } from '@/lib/i18n';
import {
  Button,
  Card,
  Divider,
  IconTile,
  ListRow,
  Screen,
  SegmentedControl,
  layout,
  spacing,
  typography,
  useTheme,
  type PreferenciaTema,
} from '@/ui';

/**
 * Ajustes, en tres bloques con cabecera: tu cuenta, tus casas y la app.
 *
 * Antes era una lista plana donde el perfil, las casas y los códigos de
 * invitado estaban al mismo nivel, y costaba encontrar nada.
 */
export default function SettingsScreen() {
  const { perfil, session, salir } = useAuth();
  const { colors, preferencia, cambiarTema } = useTheme();

  async function alSalir() {
    await salir();
    router.replace('/(auth)/sign-in');
  }

  const opcionesTema: { valor: PreferenciaTema; label: string }[] = [
    { valor: 'auto', label: t('ajustes.temaAuto') },
    { valor: 'light', label: t('ajustes.temaClaro') },
    { valor: 'dark', label: t('ajustes.temaOscuro') },
  ];

  return (
    <Screen title={t('ajustes.titulo')}>
      <Seccion titulo={t('ajustes.tuCuenta')} />
      <Card>
        <ListRow
          titulo={perfil?.display_name ?? t('ajustes.perfil')}
          subtitulo={session?.user.email ?? undefined}
          izquierda={
            <IconTile>
              <User size={20} strokeWidth={1.75} color={colors.brand} />
            </IconTile>
          }
          onPress={() => router.push('/perfil')}
        />
      </Card>

      <Seccion titulo={t('ajustes.tusCasas')} />
      <Card>
        <ListRow
          titulo={t('ajustes.casas')}
          subtitulo={t('ajustes.casasSub')}
          izquierda={
            <IconTile>
              <IconoCasa size={20} strokeWidth={1.75} color={colors.brand} />
            </IconTile>
          }
          onPress={() => router.push('/casas')}
        />
        <Divider />
        <ListRow
          titulo={t('ajustes.tengoCodigo')}
          subtitulo={t('ajustes.tengoCodigoSub')}
          izquierda={
            <IconTile>
              <KeyRound size={20} strokeWidth={1.75} color={colors.brand} />
            </IconTile>
          }
          onPress={() => router.push('/canjear')}
        />
      </Card>

      <Seccion titulo={t('ajustes.laApp')} />
      <Card>
        <View style={styles.tema}>
          <View style={styles.temaCabecera}>
            <IconTile>
              <Moon size={20} strokeWidth={1.75} color={colors.brand} />
            </IconTile>
            <View style={styles.flexible}>
              <Text style={[typography.cardTitle, { color: colors.text }]}>
                {t('ajustes.apariencia')}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {t('ajustes.temaAutoSub')}
              </Text>
            </View>
          </View>
          <SegmentedControl
            opciones={opcionesTema.map((o) => ({ valor: o.valor, label: o.label }))}
            valor={preferencia}
            onChange={cambiarTema}
          />
        </View>
      </Card>

      <View style={styles.salir}>
        <Button
          label={t('ajustes.cerrarSesion')}
          variante="secundario"
          onPress={alSalir}
          icono={<LogOut size={18} strokeWidth={1.75} color={colors.text} />}
        />
      </View>

      <Text style={[typography.caption, { color: colors.textFaint }, styles.version]}>
        {t('ajustes.version', { v: '0.2.0' })}
      </Text>
    </Screen>
  );
}

function Seccion({ titulo }: { titulo: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[typography.label, { color: colors.textMuted }, styles.seccion]}>
      {titulo.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  seccion: { paddingTop: layout.sectionGap - layout.cardGap, paddingLeft: spacing.xs },
  tema: { gap: spacing.lg },
  temaCabecera: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flexible: { flex: 1, gap: spacing.xxs },
  salir: { paddingTop: layout.sectionGap - layout.cardGap },
  version: { textAlign: 'center', paddingTop: spacing.md },
});
