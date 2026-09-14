import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

export default function StatsScreen() {
  return (
    <Screen title={t('tabs.stats')}>
      <Placeholder phase="Fase 3" what="Series de temperatura y humedad (datos reales del SHT31)" />
      <Placeholder phase="Fase 3" what="Horas de uso por dispositivo" />
    </Screen>
  );
}
