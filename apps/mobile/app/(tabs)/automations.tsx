import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

export default function AutomationsScreen() {
  return (
    <Screen title={t('tabs.automations')}>
      <Placeholder phase="Fase 3" what="Lista de automatizaciones con interruptores" />
      <Placeholder phase="Fase 3" what="Editor de disparador y acción" />
    </Screen>
  );
}
