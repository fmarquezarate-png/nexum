import { t, tList } from '@/lib/i18n';
import { Proximamente, Screen } from '@/ui';

export default function StatsScreen() {
  return (
    <Screen title={t('tabs.stats')}>
      <Proximamente
        quien="nexi"
        titulo={t('proximamente.estadisticas.titulo')}
        mensaje={t('proximamente.estadisticas.mensaje')}
        incluye={tList('proximamente.estadisticas.incluye')}
      />
    </Screen>
  );
}
