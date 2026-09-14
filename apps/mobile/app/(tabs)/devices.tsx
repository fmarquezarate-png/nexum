import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

/**
 * Dispositivos: lista agrupada por casa y habitación, con selector de casa
 * arriba (el "Mi Casa / Casa Ana" del mockup de Coolio).
 */
export default function DevicesScreen() {
  return (
    <Screen title={t('tabs.devices')}>
      <Placeholder phase="Fase 1" what="Selector de casa" />
      <Placeholder phase="Fase 2" what="Lista de dispositivos agrupada por habitación" />
      <Placeholder phase="Fase 2" what="Botón «Añadir dispositivo»" />
    </Screen>
  );
}
