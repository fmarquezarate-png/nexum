import { CalendarClock } from 'lucide-react-native';

import { t } from '@/lib/i18n';
import { Screen, VacioDeMundo } from '@/ui';

/** Programas horarios del aire. Sin mascota: Airi ya salió en Equipos. */
export default function ProgramasScreen() {
  return (
    <Screen title={t('coolio.programas')}>
      <VacioDeMundo
        Icono={CalendarClock}
        titulo={t('coolio.programasVacioTitulo')}
        texto={t('coolio.programasVacioTexto')}
      />
    </Screen>
  );
}
