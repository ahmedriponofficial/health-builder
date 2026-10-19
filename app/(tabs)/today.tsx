import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { targets } from '../../src/calc';
import { totals, useStore } from '../../src/store';
import { C } from '../../src/theme';
import { useHealthToday } from '../../src/useHealthToday';
import { Bar, Card, Check, fmt, H1, H2, Muted, Num, Screen } from '../../src/ui';

const HABITS = [
  { id: 'protein', name: 'Protein at every meal' },
  { id: 'snack', name: 'Afternoon snack' },
  { id: 'strength', name: 'Strength workout' },
  { id: 'sleep', name: 'Sleep by 23:30' },
];

export default function Today() {
  const { state, today, updateDay, latestWeight } = useStore();
  const health = useHealthToday();
  const p = state.profile;
  if (!p) return null;

  const t = targets(p, latestWeight());
  const eaten = totals(today.foods);
  const burned = health ? t.bmr + health.activeKcal + Math.round(eaten.k * 0.1) : t.maintenance;
  const balance = Math.round(eaten.k - burned);
  const habitsDone = HABITS.filter((h) => today.habits[h.id]).length;
  const score = Math.round(
    40 * Math.min(1, eaten.k / t.kcal) + 30 * Math.min(1, eaten.p / t.protein) +
    15 * Math.min(1, today.water / 8) + 15 * (habitsDone / HABITS.length)
  );
  const kLeft = Math.max(0, Math.round(t.kcal - eaten.k));
  const pLeft = Math.max(0, Math.round(t.protein - eaten.p));
  const tip = kLeft === 0 && pLeft === 0
    ? 'Targets reached today. Great work.'
    : `${fmt(kLeft)} kcal and ${pLeft} g protein to go. ${today.water < 8 ? `Drink ${8 - today.water} more glasses of water.` : ''}`;
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen>
      <View>
        <Muted>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</Muted>
        <H1>{hello}</H1>
      </View>

      <Card style={{ backgroundColor: C.green, flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 8, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFF', fontSize: 28, fontWeight: '700' }}>{score}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: '#D6E8DC', fontSize: 12, fontWeight: '600' }}>Today's score</Text>
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600', lineHeight: 22 }}>{tip}</Text>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Card style={{ flex: 1 }}>
          <Muted>Calories</Muted><Num>{fmt(eaten.k)}</Num>
          <Bar value={eaten.k / t.kcal} /><Muted style={{ fontSize: 11 }}>of {fmt(t.kcal)}</Muted>
        </Card>
        <Card style={{ flex: 1 }}>
          <Muted>Protein</Muted><Num>{Math.round(eaten.p)} g</Num>
          <Bar value={eaten.p / t.protein} color={C.orange} /><Muted style={{ fontSize: 11 }}>of {t.protein} g</Muted>
        </Card>
        <Card style={{ flex: 1 }}>
          <Muted>Water</Muted><Num>{today.water} / 8</Num>
          <Bar value={today.water / 8} color={C.blue} /><Muted style={{ fontSize: 11 }}>glasses</Muted>
        </Card>
      </View>

      <Card>
        <H2>Energy balance</H2>
        <Row a="Eaten" b={`${fmt(eaten.k)} kcal`} />
        <Row a={health ? `Burned (BMR ${fmt(t.bmr)} + active ${fmt(health.activeKcal)} + digestion)` : 'Burned (estimate)'} b={`${fmt(burned)} kcal`} />
        {health ? <Row a="Steps today" b={fmt(health.steps)} /> : null}
        <View style={{ borderTopWidth: 1, borderTopColor: '#EEF2EE', paddingTop: 8 }}>
          <Row a="Balance" b={`${balance >= 0 ? '+' : ''}${fmt(balance)} kcal`} bold color={balance >= 0 ? C.green : C.orange} />
        </View>
        {!state.healthConnected ? (
          <Pressable onPress={() => router.push('/connect')} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ color: C.green, fontWeight: '700' }}>Connect Apple Health for real steps</Text>
          </Pressable>
        ) : null}
      </Card>

      <H2>Today's habits</H2>
      {HABITS.map((h) => (
        <Check key={h.id} label={h.name} on={!!today.habits[h.id]}
          onPress={() => updateDay((d) => ({ ...d, habits: { ...d.habits, [h.id]: !d.habits[h.id] } }))} />
      ))}
    </Screen>
  );
}

function Row({ a, b, bold, color }: { a: string; b: string; bold?: boolean; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ flex: 1, fontSize: 14, color: C.ink, fontWeight: bold ? '700' : '400' }}>{a}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: color ?? C.ink }}>{b}</Text>
    </View>
  );
}
