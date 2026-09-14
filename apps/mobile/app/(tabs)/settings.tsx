import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

export default function SettingsScreen() {
  return (
    <Screen title={t('tabs.settings')}>
      <Placeholder phase="Fase 1" what="Perfil" />
      <Placeholder phase="Fase 1" what="Gestión de casas y habitaciones" />
      <Placeholder phase="Fase 1" what="Miembros y códigos QR de invitado" />
      <Placeholder phase="Fase 2" what="Dispositivos" />
      <Placeholder phase="Fase 3" what="Notificaciones" />
    </Screen>
  );
}
