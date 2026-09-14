import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

export default function ForgotPasswordScreen() {
  return (
    <Screen title={t('auth.forgotPassword')}>
      <Placeholder phase="Fase 1" what="Recuperación de contraseña por correo" />
    </Screen>
  );
}
