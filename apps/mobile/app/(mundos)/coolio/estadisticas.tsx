import { BarChart3 } from 'lucide-react-native';

import { t } from '@/lib/i18n';
import { Screen, VacioDeMundo } from '@/ui';

/** Estadísticas del oficio: horas de uso del aire, no el clima de la casa. */
export default function EstadisticasCoolioScreen() {
  return (
    <Screen title={t('tabs.stats')}>
      <VacioDeMundo
        Icono={BarChart3}
        titulo={t('coolio.statsVacioTitulo')}
        texto={t('coolio.statsVacioTexto')}
      />
    </Screen>
  );
}
