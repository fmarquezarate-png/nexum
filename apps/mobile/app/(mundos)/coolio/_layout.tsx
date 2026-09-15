import { Tabs } from 'expo-router';
import { BarChart3, CalendarClock, Settings, Wind } from 'lucide-react-native';

import { manifiesto } from '@/modules/coolio';
import { t } from '@/lib/i18n';
import { MundoTabs } from '@/ui';

/**
 * Las cuatro pestañas del mundo Coolio, tal como aparecen en el mockup:
 * Equipos · Programas · Estadísticas · Ajustes.
 *
 * Todo el trabajo —la puerta de salida a Nexum, la cabecera con el
 * logotipo y el acento cyan— lo resuelve MundoTabs. El día que llegue
 * Plantico, su layout es este mismo con otros cuatro nombres.
 */
export default function CoolioLayout() {
  const icono =
    (Icono: typeof Wind) =>
    ({ color, focused }: { color: string; focused: boolean }) => (
      <Icono size={23} strokeWidth={focused ? 2.2 : 1.75} color={color} />
    );

  return (
    <MundoTabs modulo="coolio" logo={manifiesto.logo}>
      <Tabs.Screen name="index" options={{ title: t('coolio.equipos'), tabBarIcon: icono(Wind) }} />
      <Tabs.Screen
        name="programas"
        options={{ title: t('coolio.programas'), tabBarIcon: icono(CalendarClock) }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{ title: t('tabs.stats'), tabBarIcon: icono(BarChart3) }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{ title: t('ajustes.titulo'), tabBarIcon: icono(Settings) }}
      />

      {/* Estas dos son pantallas del mundo, no secciones suyas: se abren
          desde dentro y no deben salir en la barra. Sin href:null, Expo
          Router convierte en pestaña TODO archivo de la carpeta, y la
          barra acaba con seis rótulos recortados. */}
      <Tabs.Screen name="anadir" options={{ href: null }} />
      <Tabs.Screen name="equipo/[id]" options={{ href: null }} />
    </MundoTabs>
  );
}
