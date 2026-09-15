import { t, tList } from '@/lib/i18n';
import { Proximamente, Screen } from '@/ui';

/**
 * Alta de un dispositivo nuevo.
 *
 * Existe porque el botón "Añadir dispositivo" llevaba al asistente de
 * CREAR CASA, que no tiene nada que ver: quien quiere conectar un aparato
 * ya tiene casa, y lo que se le ofrecía era crear otra.
 *
 * El emparejado de verdad —punto de acceso del ESP32, portal cautivo y
 * token de reclamo— llega con Coolio. Ver docs/provisioning.md.
 */
export default function EmparejarScreen() {
  return (
    <Screen title={t('emparejar.titulo')}>
      <Proximamente
        quien="airi"
        titulo={t('emparejar.proximoTitulo')}
        mensaje={t('emparejar.proximoMensaje')}
        incluye={tList('emparejar.incluye')}
      />
    </Screen>
  );
}
