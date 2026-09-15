import { Bell, Info, Ruler } from 'lucide-react-native';
import { View } from 'react-native';

import { manifiesto } from '@/modules/coolio';
import { t } from '@/lib/i18n';
import { Card, Divider, IconTile, ListRow, Screen, themeForModule, useTheme } from '@/ui';

/**
 * Ajustes de Coolio.
 *
 * NUNCA está vacía: las unidades, los avisos y "Acerca de" existen aunque
 * no tengas ningún aire. Por eso no lleva estado vacío.
 */
export default function AjustesCoolioScreen() {
  const { scheme } = useTheme();
  const acento = themeForModule('coolio', scheme);

  return (
    <Screen title={t('ajustes.titulo')}>
      <Card>
        <ListRow
          titulo={t('coolio.ajustesUnidades')}
          subtitulo="Grados Celsius"
          izquierda={
            <IconTile fondo={acento.soft}>
              <Ruler size={20} strokeWidth={1.75} color={acento.primary} />
            </IconTile>
          }
          flecha={false}
        />
        <Divider />
        <ListRow
          titulo={t('coolio.ajustesAvisos')}
          subtitulo="Cuando un equipo pierde la señal"
          izquierda={
            <IconTile fondo={acento.soft}>
              <Bell size={20} strokeWidth={1.75} color={acento.primary} />
            </IconTile>
          }
          flecha={false}
        />
        <Divider />
        <ListRow
          titulo={t('coolio.ajustesAcerca')}
          subtitulo={manifiesto.tagline}
          izquierda={
            <IconTile fondo={acento.soft}>
              <Info size={20} strokeWidth={1.75} color={acento.primary} />
            </IconTile>
          }
          flecha={false}
        />
      </Card>
      <View />
    </Screen>
  );
}
