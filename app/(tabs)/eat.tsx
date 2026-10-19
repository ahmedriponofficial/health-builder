import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MEALS, targets } from '../../src/calc';
import { SUGGESTIONS } from '../../src/foods';
import { totals, useStore } from '../../src/store';
import { C } from '../../src/theme';
import { Bar, Card, fmt, H1, Muted, Screen } from '../../src/ui';

export default function Eat() {
  const { state, today, latestWeight } = useStore();
  const [pick, setPick] = useState<Record<string, number>>({});
  const p = state.profile;
  if (!p) return null;
  const t = targets(p, latestWeight());
  const r50 = (v: number) => Math.round(v / 50) * 50;

  return (
    <Screen>
      <View>
        <Muted>Your daily target</Muted>
        <H1>Today's meals</H1>
      </View>
      <Card style={{ backgroundColor: C.green, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#D6E8DC', fontSize: 12, fontWeight: '600' }}>Daily calories</Text>
          <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '700' }}>{fmt(t.kcal)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#D6E8DC', fontSize: 12, fontWeight: '600' }}>Daily protein</Text>
          <Text style={{ color: '#FFF', fontSize: 26, fontWeight: '700' }}>{t.protein} g</Text>
        </View>
      </Card>

      <Pressable onPress={() => router.push('/add-food')}
        style={{ minHeight: 50, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#8FB89E', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.green, fontWeight: '700', fontSize: 15 }}>+ Log what I ate</Text>
      </Pressable>

      {MEALS.map((m) => {
        const tk = r50(t.kcal * m.share);
        const tp = Math.round(t.protein * m.share);
        const eaten = totals(today.foods.filter((f) => f.meal === m.id));
        const opts = SUGGESTIONS[m.id];
        const i = pick[m.id] ?? 0;
        const o = opts[i];
        return (
          <Card key={m.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.ink }}>{m.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.green }}>~{fmt(tk)} kcal · {tp} g</Text>
            </View>
            {eaten.k > 0 ? (
              <>
                <Bar value={eaten.k / tk} />
                <Muted>Eaten {fmt(eaten.k)} kcal · {Math.round(eaten.p)} g protein</Muted>
              </>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 14, color: C.ink, lineHeight: 20 }}>{o.text}</Text>
                  <Muted style={{ fontSize: 12 }}>This option: {o.k} kcal · {o.p} g protein</Muted>
                </View>
                <Pressable accessibilityLabel={`Swap ${m.name} suggestion`} onPress={() => setPick({ ...pick, [m.id]: (i + 1) % opts.length })}
                  style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#C9D3CA', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: C.ink }}>⇄</Text>
                </Pressable>
              </View>
            )}
          </Card>
        );
      })}
      <Muted style={{ fontSize: 11 }}>Values are approximate, based on typical portions.</Muted>
    </Screen>
  );
}
