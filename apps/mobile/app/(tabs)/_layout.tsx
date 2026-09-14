import { Tabs } from 'expo-router';

import { t } from '@/lib/i18n';
import { colors, typography } from '@/ui';

/**
 * Las cinco pestañas de la app, tal como aparecen en el mockup de Nexum.
 *
 * Sin iconos todavía: se añaden cuando estén los assets definitivos.
 * Estructura antes que adornos.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: typography.label.fontSize, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home') }} />
      <Tabs.Screen name="devices" options={{ title: t('tabs.devices') }} />
      <Tabs.Screen name="automations" options={{ title: t('tabs.automations') }} />
      <Tabs.Screen name="stats" options={{ title: t('tabs.stats') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
