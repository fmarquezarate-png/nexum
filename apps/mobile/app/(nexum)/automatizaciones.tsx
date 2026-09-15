import { t } from '@/lib/i18n';
import { EmptyState, Screen } from '@/ui';

/**
 * Automatizaciones de la CASA: las que cruzan módulos y las escenas.
 *
 * Las reglas de un solo oficio —"apaga el aire a las 23:00"— viven dentro
 * de su mundo. Aquí solo lo que responde a "¿cómo quiero que funcione mi
 * casa?", no a "¿cómo quiero que funcione mi aire?".
 *
 * Sin mascota: Nexi ya ha saludado en Inicio, y una por recorrido.
 */
export default function AutomatizacionesScreen() {
  return (
    <Screen title={t('automatizaciones.titulo')}>
      <EmptyState
        titulo={t('automatizaciones.vacioTitulo')}
        descripcion={`${t('automatizaciones.vacioTexto')}\n\n${t('automatizaciones.sinDispositivos')}`}
      />
    </Screen>
  );
}
