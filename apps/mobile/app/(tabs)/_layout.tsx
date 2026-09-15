import { Tabs } from 'expo-router';
import { BarChart3, House, Settings, Sparkles, Thermometer } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { t } from '@/lib/i18n';
import { layout, typography, useTheme } from '@/ui';

/**
 * Las cinco pestañas, tal como aparecen en el mockup de Nexum.
 *
 * Los iconos son de trazo fino y grosor uniforme (1.75). Ese detalle es
 * la mitad de lo que hace que una barra de pestañas se vea cuidada; la
 * otra mitad es que el rótulo sea pequeño y el icono mande.
 *
 * La barra NUNCA lleva el color de un módulo: es territorio de Nexum.
 */
export default function TabsLayout() {
  const { colors, shadow } = useTheme();

  const icono =
    (Icono: typeof House) =>
    ({ color, focused }: { color: string; focused: boolean }) => (
      <Icono size={23} strokeWidth={focused ? 2.2 : 1.75} color={color} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: [
          styles.barra,
          shadow.subtle,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
            height: layout.tabBarHeight + 34,
          },
        ],
        tabBarLabelStyle: typography.tabLabel,
        tabBarItemStyle: styles.item,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: icono(House) }}
      />
      <Tabs.Screen
        name="devices"
        options={{ title: t('tabs.devices'), tabBarIcon: icono(Thermometer) }}
      />
      <Tabs.Screen
        name="automations"
        options={{ title: t('tabs.automations'), tabBarIcon: icono(Sparkles) }}
      />
      <Tabs.Screen
        name="stats"
        options={{ title: t('tabs.stats'), tabBarIcon: icono(BarChart3) }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t('tabs.settings'), tabBarIcon: icono(Settings) }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barra: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  item: { paddingVertical: 4 },
});
