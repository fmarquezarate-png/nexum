import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

export default function SignUpScreen() {
  return (
    <Screen title={t('auth.signUp')}>
      <Placeholder phase="Fase 1" what="Formulario de registro" />
    </Screen>
  );
}
