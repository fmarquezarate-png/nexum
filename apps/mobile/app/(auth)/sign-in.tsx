import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

/** Login con email y contraseña. OAuth (Google/Apple) queda para más adelante. */
export default function SignInScreen() {
  return (
    <Screen title={t('auth.signIn')} subtitle={t('app.tagline')}>
      <Placeholder phase="Fase 1" what="Formulario de correo y contraseña" />
    </Screen>
  );
}
