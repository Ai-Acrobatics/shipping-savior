import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, type ColorValue } from 'react-native';
import { useTheme } from '@/lib/theme';

// Active tabs use the filled glyph, inactive the outline — a small, premium
// polish that reads clearer than color alone.
function icon(base: string) {
  return ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={(focused ? base : `${base}-outline`) as never} size={size - 1} color={color as string} />
  );
}

export default function TabsLayout() {
  const c = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.bg },
        headerTintColor: c.text,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: c.bgElevated,
          borderTopColor: c.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 62,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textFaint,
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Shipments', tabBarIcon: icon('boat') }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: icon('scan') }} />
      <Tabs.Screen
        name="assistant"
        options={{ title: 'Assistant', tabBarIcon: icon('chatbubble-ellipses') }}
      />
      <Tabs.Screen name="calculators" options={{ title: 'Calculate', tabBarIcon: icon('calculator') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('person-circle') }} />
    </Tabs>
  );
}
