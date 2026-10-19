import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MEALS } from '../../src/calc';
import { totals, useStore } from '../../src/store';
import { C } from '../../src/theme';
import { Button, Card, Field, fmt, H1, H2, Muted, Screen } from '../../src/ui';

const MOODS = ['Awful', 'Low', 'Okay', 'Good', 'Great'];

export default function Log() {
  const { today, updateDay, latestWeight } = useStore();
  const [w, setW] = useState('');
  const [saved, setSaved] = useState(false);

  const saveWeight = () => {
    const v = parseFloat(w.replace(',', '.'));
    if (!(v > 0)) return;
    updateDay((d) => ({ ...d, weight: v }));
    setW(''); setSaved(true);
  };

  return (
    <Screen>
      <H1>Quick log</H1>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <H2>Water</H2><Text style={{ fontWeight: '700', color: C.blue }}>{today.water} / 8</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <Pressable key={n} accessibilityLabel={`${n} glasses`} onPress={() => updateDay((d) => ({ ...d, water: d.water === n ? n - 1 : n }))}
              style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 2, borderColor: C.blue, backgroundColor: n <= today.water ? C.blue : '#FFF' }} />
          ))}
        </View>
      </Card>

      <Card>
        <H2>How do you feel?</H2>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {MOODS.map((m, i) => {
            const on = today.mood === i;
            return (
              <Pressable key={m} onPress={() => updateDay((d) => ({ ...d, mood: i }))}
                style={{ flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 2, borderColor: on ? C.green : C.line, backgroundColor: on ? C.green : '#FFF', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: on ? '#FFF' : C.ink }}>{m}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2>Meals today</H2>
          <Pressable onPress={() => router.push('/add-food')} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ color: C.green, fontWeight: '700' }}>+ Add food</Text>
          </Pressable>
        </View>
        {MEALS.map((m) => {
          const items = today.foods.filter((f) => f.meal === m.id);
          const t = totals(items);
          return (
            <View key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2EE', gap: 8 }}>
              <Text style={{ fontWeight: '600', color: C.ink }}>{m.name}</Text>
              <Muted style={{ flex: 1, textAlign: 'right' }} >{items.length ? `${items.map((f) => f.name).join(', ')} · ${fmt(t.k)} kcal` : 'Not logged'}</Muted>
            </View>
          );
        })}
      </Card>

      <Card>
        <H2>Weight</H2>
        <Muted>Last: {latestWeight() ?? '—'} kg. Weigh in the morning, same day each week.</Muted>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
          <Field label="Today (kg)" keyboardType="decimal-pad" value={w} onChangeText={(v) => { setW(v); setSaved(false); }} placeholder={today.weight ? String(today.weight) : '62.4'} />
          <View style={{ width: 90 }}><Button title="Save" variant="green" onPress={saveWeight} /></View>
        </View>
        {saved ? <Text style={{ color: C.green, fontWeight: '600' }}>Weight saved</Text> : null}
      </Card>
    </Screen>
  );
}
