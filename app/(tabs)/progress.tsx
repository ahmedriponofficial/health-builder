import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { targets } from '../../src/calc';
import { dayKey, totals, useStore } from '../../src/store';
import { C } from '../../src/theme';
import { Button, Card, fmt, H1, H2, Muted, Num, Screen } from '../../src/ui';

export default function Progress() {
  const { state, latestWeight, reset } = useStore();
  const p = state.profile;
  if (!p) return null;
  const t = targets(p, latestWeight());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const day = state.days[dayKey(d)];
    return { label: d.toLocaleDateString('en-GB', { weekday: 'narrow' }), k: day ? totals(day.foods).k : 0 };
  });
  const max = Math.max(t.kcal * 1.1, ...days.map((d) => d.k));
  const logged = days.filter((d) => d.k > 0);
  const avg = logged.length ? logged.reduce((a, d) => a + d.k, 0) / logged.length : 0;

  const weights = Object.keys(state.days).sort()
    .filter((k) => state.days[k].weight).map((k) => ({ k, w: state.days[k].weight as number }));
  const now = latestWeight() ?? p.weight;
  const change = Math.round((now - p.weight) * 10) / 10;

  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const day = state.days[dayKey(d)];
    if (day && day.foods.length) streak++; else if (i > 0) break; else continue;
    if (i > 365) break;
  }

  return (
    <Screen>
      <H1>Progress</H1>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1 }}><Muted>Logging streak</Muted><Num style={{ color: C.orange }}>{streak} days</Num></Card>
        <Card style={{ flex: 1 }}><Muted>Weight change</Muted><Num style={{ color: C.green }}>{change > 0 ? '+' : ''}{change} kg</Num></Card>
      </View>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <H2>Calories, last 7 days</H2>
          <Muted>avg {fmt(avg)}</Muted>
        </View>
        <View style={{ height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          {days.map((d, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <View style={{ width: '100%', height: Math.max(4, (d.k / max) * 124), borderRadius: 8, backgroundColor: d.k >= t.kcal ? C.orange : d.k ? C.green : C.track }} />
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.muted }}>{d.label}</Text>
            </View>
          ))}
        </View>
        <Muted style={{ fontSize: 12 }}>Orange = target of {fmt(t.kcal)} kcal reached</Muted>
      </Card>

      <Card>
        <H2>Weight log</H2>
        {weights.length === 0 ? <Muted>No weigh-ins yet. Add one in the Log tab.</Muted> :
          weights.slice(-6).reverse().map((x) => (
            <View key={x.k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: C.ink }}>{x.k}</Text><Text style={{ fontWeight: '700', color: C.ink }}>{x.w} kg</Text>
            </View>
          ))}
      </Card>

      <Button title="Edit my goal" variant="green" onPress={() => router.push('/onboarding')} />
      <Button title="Reset all data" variant="ghost" onPress={() =>
        Alert.alert('Reset all data?', 'This deletes your goal and every log on this phone.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: () => { reset(); router.replace('/onboarding'); } },
        ])} />
    </Screen>
  );
}
