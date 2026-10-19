import { Text, View } from 'react-native';
import { useStore } from '../../src/store';
import { C } from '../../src/theme';
import { Card, Check, H1, H2, Muted, Screen } from '../../src/ui';

const PLAN = [
  { id: 'warm', name: 'Warm-up march', meta: '3 min' },
  { id: 'squat', name: 'Squats', meta: '3 × 10, slow down' },
  { id: 'push', name: 'Push-ups (knees ok)', meta: '3 × 8' },
  { id: 'bridge', name: 'Glute bridge', meta: '3 × 12' },
  { id: 'row', name: 'Backpack rows', meta: '3 × 10 each arm' },
  { id: 'plank', name: 'Plank', meta: '3 × 30 sec' },
];

export default function Move() {
  const { today, updateDay } = useStore();
  const done = PLAN.filter((x) => today.exercises[x.id]).length;
  const toggle = (id: string) => updateDay((d) => {
    const exercises = { ...d.exercises, [id]: !d.exercises[id] };
    const all = PLAN.every((x) => exercises[x.id]);
    return { ...d, exercises, habits: { ...d.habits, strength: all || d.habits.strength } };
  });

  return (
    <Screen>
      <H1>Move</H1>
      <Card style={{ backgroundColor: C.ink, padding: 20, gap: 10 }}>
        <Text style={{ color: '#BFD8C8', fontSize: 12, fontWeight: '600' }}>Today's plan · Muscle gain</Text>
        <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700' }}>Beginner strength, full body</Text>
        <Text style={{ color: '#DCE6DD' }}>About 20 min · no equipment · 3 times a week</Text>
        <Text style={{ color: C.peach, fontWeight: '700' }}>{done} of {PLAN.length} done</Text>
      </Card>
      <H2>Exercises</H2>
      {PLAN.map((x) => <Check key={x.id} label={x.name} meta={x.meta} on={!!today.exercises[x.id]} onPress={() => toggle(x.id)} />)}
      <Muted>Rest 60–90 seconds between sets. When 3 sets feel easy, add 2 reps.</Muted>
      <View />
    </Screen>
  );
}
