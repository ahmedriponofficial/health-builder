import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { C } from '../../src/theme';

const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, size }: { color: string; size: number }) => (
  <Ionicons name={name} color={color} size={size} />
);

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: C.green,
      tabBarInactiveTintColor: C.muted,
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: C.line },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: icon('home-outline') }} />
      <Tabs.Screen name="log" options={{ title: 'Log', tabBarIcon: icon('add-circle-outline') }} />
      <Tabs.Screen name="eat" options={{ title: 'Eat', tabBarIcon: icon('restaurant-outline') }} />
      <Tabs.Screen name="move" options={{ title: 'Move', tabBarIcon: icon('barbell-outline') }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: icon('stats-chart-outline') }} />
    </Tabs>
  );
}
