import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MEALS, MealId, mealForHour, targets } from '../src/calc';
import { Food, parseFoodText, searchFoods, Unknown } from '../src/foods';
import { LoggedFood, totals, useStore } from '../src/store';
import { C } from '../src/theme';
import { Button, Card, Field, fmt, H2, Muted } from '../src/ui';

type Item = { food: Food; qty: number };

export default function AddFood() {
  const { state, today, updateDay, latestWeight, saveCustomFood } = useStore();
  const custom = state.customFoods ?? [];
  const now = new Date();
  const [time, setTime] = useState(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  const [meal, setMeal] = useState<MealId>(mealForHour(now.getHours() + now.getMinutes() / 60));
  const [mode, setMode] = useState<'type' | 'search'>('type');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [queue, setQueue] = useState<Unknown[]>([]);
  const results = useMemo(() => searchFoods(query, custom), [query, custom]);

  const add = (food: Food, qty = 1) => setItems((list) => {
    const i = list.findIndex((x) => x.food.id === food.id);
    if (i < 0) return [...list, { food, qty }];
    const copy = list.slice(); copy[i] = { ...copy[i], qty: copy[i].qty + qty }; return copy;
  });
  const change = (i: number, d: number) => setItems((list) => {
    const copy = list.slice();
    const q = Math.round((copy[i].qty + d) * 10) / 10;
    if (q <= 0) copy.splice(i, 1); else copy[i] = { ...copy[i], qty: q };
    return copy;
  });
  const calculate = () => {
    const r = parseFoodText(text, custom);
    r.entries.forEach((e) => add(e.food, e.qty));
    setQueue(r.unknown);
    setText('');
  };

  const sum = items.reduce((a, x) => ({ k: a.k + x.food.k * x.qty, p: a.p + x.food.p * x.qty }), { k: 0, p: 0 });
  const p = state.profile;
  const m = MEALS.find((x) => x.id === meal)!;
  const t = p ? targets(p, latestWeight()) : null;
  const target = t ? Math.round((t.kcal * m.share) / 50) * 50 : 0;
  const already = totals(today.foods.filter((f) => f.meal === meal)).k;
  const toGo = Math.round(target - already - sum.k);

  const save = () => {
    const entries: LoggedFood[] = items.map((x, i) => ({
      id: `${Date.now()}-${i}`, name: x.food.name, qty: x.qty, unit: x.food.unit, k: x.food.k, p: x.food.p, meal, time,
    }));
    updateDay((d) => ({ ...d, foods: [...d.foods, ...entries] }));
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ flex: 1, fontSize: 22, fontWeight: '700', color: C.ink }}>Add food</Text>
          <Muted>Time</Muted>
          <TextInput value={time} onChangeText={setTime} style={{ width: 70, height: 40, borderRadius: 12, borderWidth: 1, borderColor: '#C9D3CA', backgroundColor: '#FFF', textAlign: 'center', fontSize: 15, fontWeight: '700', color: C.ink }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {MEALS.map((x) => {
            const on = x.id === meal;
            return (
              <Pressable key={x.id} onPress={() => setMeal(x.id)} style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: on ? C.green : '#C9D3CA', backgroundColor: on ? C.green : '#FFF', justifyContent: 'center' }}>
                <Text style={{ fontWeight: '700', color: on ? '#FFF' : C.ink }}>{x.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ flexDirection: 'row', backgroundColor: '#E3EAE3', borderRadius: 14, padding: 4, gap: 4 }}>
          {(['type', 'search'] as const).map((x) => (
            <Pressable key={x} onPress={() => setMode(x)} style={{ flex: 1, minHeight: 40, borderRadius: 11, backgroundColor: mode === x ? '#FFF' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontWeight: '700', color: mode === x ? C.ink : C.muted }}>{x === 'type' ? 'Type' : 'Search'}</Text>
            </Pressable>
          ))}
        </View>

        {mode === 'type' ? (
          <Card>
            <H2>What did you eat?</H2>
            <TextInput value={text} onChangeText={setText} multiline placeholder="2 rotis and chicken curry, glass of milk"
              placeholderTextColor="#8A968F"
              style={{ minHeight: 64, borderWidth: 1, borderColor: '#C9D3CA', borderRadius: 12, padding: 12, fontSize: 15, color: C.ink, backgroundColor: '#F9FBF8' }} />
            <Button title="Calculate" variant="green" onPress={calculate} disabled={!text.trim()} />
          </Card>
        ) : (
          <View style={{ gap: 8 }}>
            <TextInput value={query} onChangeText={setQuery} placeholder="Search foods (rice, egg, milk…)" placeholderTextColor="#8A968F"
              style={{ height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#C9D3CA', backgroundColor: '#FFF', paddingHorizontal: 12, fontSize: 15, color: C.ink }} />
            {query.trim() && !results.some((f) => f.name.toLowerCase() === query.trim().toLowerCase()) ? (
              <Pressable onPress={() => setQueue([{ name: query.trim().charAt(0).toUpperCase() + query.trim().slice(1), qty: 1 }])}
                style={{ minHeight: 48, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#8FB89E', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 }}>
                <Text style={{ color: C.green, fontWeight: '700' }}>+ Create "{query.trim()}" as my food</Text>
              </Pressable>
            ) : null}
            {results.map((f) => (
              <View key={f.id} style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: C.ink }}>{f.name}{f.custom ? '  · My food' : ''}</Text>
                  <Muted style={{ fontSize: 12 }}>1 {f.unit} · {f.k} kcal · {f.p} g protein</Muted>
                </View>
                <Pressable accessibilityLabel={`Add ${f.name}`} onPress={() => add(f)} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: C.green }}>+</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {queue.length ? (
          <CustomFoodForm key={queue[0].name} start={queue[0]} left={queue.length - 1}
            onSave={(food, qty) => { saveCustomFood(food); add(food, qty); setQueue((q) => q.slice(1)); }}
            onSkip={() => setQueue((q) => q.slice(1))} />
        ) : null}

        <Card>
          {items.length === 0 ? <Muted>Nothing added yet.</Muted> : items.map((x, i) => (
            <View key={x.food.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: C.ink }}>{x.food.name}</Text>
                <Muted style={{ fontSize: 12 }}>{Math.round(x.food.k * x.qty)} kcal · {Math.round(x.food.p * x.qty)} g protein</Muted>
              </View>
              <Step label="−" onPress={() => change(i, x.qty > 1 ? -1 : -0.5)} />
              <Text style={{ width: 70, textAlign: 'center', fontWeight: '700', color: C.ink, fontSize: 13 }}>{x.qty} {x.food.unit}{x.qty === 1 ? '' : 's'}</Text>
              <Step label="+" onPress={() => change(i, x.qty < 1 ? 0.5 : 1)} />
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#EEF2EE', paddingTop: 8 }}>
            <Text style={{ fontWeight: '700', color: C.ink }}>Total</Text>
            <Text style={{ fontWeight: '700', color: C.green }}>{fmt(sum.k)} kcal · {Math.round(sum.p)} g</Text>
          </View>
          {t ? <Muted style={{ fontSize: 12 }}>{m.name} target ~{fmt(target)} kcal. {toGo > 0 ? `${fmt(toGo)} kcal to go.` : 'Target reached.'}</Muted> : null}
        </Card>
      </ScrollView>
      <View style={{ padding: 20, paddingTop: 10, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: C.line, gap: 8 }}>
        <Button title={`Save to ${m.name}`} onPress={save} disabled={!items.length} />
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

function Step({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label === '+' ? 'More' : 'Less'} onPress={onPress}
      style={{ width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: '#C9D3CA', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, color: C.ink }}>{label}</Text>
    </Pressable>
  );
}

function CustomFoodForm({ start, left, onSave, onSkip }: {
  start: Unknown; left: number; onSave: (f: Food, qty: number) => void; onSkip: () => void;
}) {
  const [name, setName] = useState(start.name);
  const [unit, setUnit] = useState('portion');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const k = parseFloat(kcal.replace(',', '.'));
  const p = parseFloat(protein.replace(',', '.')) || 0;
  const ok = name.trim().length > 0 && k > 0;

  const save = () => {
    const n = name.trim();
    const id = 'my-' + n.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    onSave({ id, name: n, unit: unit.trim() || 'portion', k: Math.round(k), p: Math.round(p * 10) / 10, words: [n.toLowerCase()], custom: true }, start.qty);
  };

  return (
    <Card style={{ borderWidth: 2, borderColor: C.peach }}>
      <H2>New food: {start.name}</H2>
      <Muted>Not in the list yet. Add it once and the app will recognise it next time. Use the package label, or a rough estimate.</Muted>
      <View style={{ flexDirection: 'row' }}><Field label="Name" value={name} onChangeText={setName} /></View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Field label="Portion" value={unit} onChangeText={setUnit} placeholder="piece, bowl, 100 g" />
        <Field label="Calories" keyboardType="number-pad" value={kcal} onChangeText={setKcal} placeholder="250" />
        <Field label="Protein g" keyboardType="decimal-pad" value={protein} onChangeText={setProtein} placeholder="6" />
      </View>
      <Muted style={{ fontSize: 12 }}>Values for 1 {unit || 'portion'}. You ate {start.qty}.</Muted>
      <Button title="Save food" variant="green" onPress={save} disabled={!ok} />
      <Button title={left ? `Skip (${left} more)` : 'Skip'} variant="ghost" onPress={onSkip} />
    </Card>
  );
}
