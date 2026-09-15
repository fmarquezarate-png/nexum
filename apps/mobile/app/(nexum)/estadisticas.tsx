import { t } from '@/lib/i18n';
import { EmptyState, Screen } from '@/ui';

/**
 * Estadísticas de la CASA: clima, consumo, cómo va el conjunto.
 *
 * Las de cada oficio —horas de frío, litros regados— viven dentro de su
 * mundo. Aquí se responde "¿cómo va mi casa?", no "¿cómo va mi aire?".
 *
 * NUNCA lleva mascota. Ni Nexi ni ninguna otra: es una pantalla de datos,
 * y un dibujo sonriente encima de una gráfica vacía sobra.
 */
export default function EstadisticasScreen() {
  return (
    <Screen title={t('estadisticas.titulo')}>
      <EmptyState
        titulo={t('estadisticas.vacioTitulo')}
        descripcion={t('estadisticas.vacioTexto')}
      />
    </Screen>
  );
}
