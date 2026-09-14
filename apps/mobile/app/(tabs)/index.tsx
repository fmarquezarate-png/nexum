import { Screen, Placeholder } from '@/ui';
import { t } from '@/lib/i18n';

/**
 * Inicio.
 *
 * Contenido previsto (mockup de Nexum):
 *   - Saludo + clima exterior
 *   - Escenas: En casa / Noche / Fuera / Eco
 *     (son GRUPOS DE AUTOMATIZACIONES, no una entidad nueva)
 *   - Tarjetas de dispositivos con estado en vivo
 *   - Automatizaciones activas con interruptor
 */
export default function HomeScreen() {
  return (
    <Screen title={t('app.name')} subtitle={t('app.tagline')}>
      <Placeholder phase="Fase 1" what="Saludo y clima exterior" />
      <Placeholder phase="Fase 3" what="Escenas: En casa / Noche / Fuera / Eco" />
      <Placeholder phase="Fase 2" what="Tarjetas de dispositivos con estado en vivo" />
      <Placeholder phase="Fase 3" what="Automatizaciones activas" />
    </Screen>
  );
}
