import { t, tList } from '@/lib/i18n';
import { Proximamente, Screen } from '@/ui';

export default function AutomationsScreen() {
  return (
    <Screen title={t('tabs.automations')}>
      <Proximamente
        quien="nexi"
        titulo={t('proximamente.automatizaciones.titulo')}
        mensaje={t('proximamente.automatizaciones.mensaje')}
        incluye={tList('proximamente.automatizaciones.incluye')}
      />
    </Screen>
  );
}
