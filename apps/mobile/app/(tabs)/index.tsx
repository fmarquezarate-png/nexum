import { useAuth } from '@/core/auth';
import { t } from '@/lib/i18n';
import { Placeholder, Screen } from '@/ui';

/**
 * Inicio.
 *
 * Contenido previsto (mockup de Nexum): saludo, clima exterior, escenas
 * (En casa / Noche / Fuera / Eco), tarjetas de dispositivos con estado en
 * vivo y automatizaciones activas.
 *
 * Las escenas son GRUPOS DE AUTOMATIZACIONES, no una entidad nueva.
 */
export default function HomeScreen() {
  const { perfil } = useAuth();

  return (
    <Screen
      title={t('home.greeting', { name: perfil?.display_name ?? '' })}
      subtitle={t('home.subtitle')}
    >
      <Placeholder phase="Fase 3" what="Clima exterior" />
      <Placeholder phase="Fase 3" what="Escenas: En casa / Noche / Fuera / Eco" />
      <Placeholder phase="Fase 2" what="Tarjetas de dispositivos con estado en vivo" />
      <Placeholder phase="Fase 3" what="Automatizaciones activas" />
    </Screen>
  );
}
