import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ACTIVITY, Goal, PACE, Profile, targets, weeksToGoal } from '../src/calc';
import { useStore } from '../src/store';
import { C } from '../src/theme';
import { Bar, Button, Card, Chip, Field, fmt, H1, Muted, Num, Screen } from '../src/ui';

const GOALS: { id: Goal; name: string; sub: string }[] = [
  { id: 'gain', name: 'Gain weight', sub: 'Build muscle and healthy mass' },
  { id: 'lose', name: 'Lose weight', sub: 'Lose fat at a steady pace' },
  { id: 'energy', name: 'More energy', sub: 'Eat, move and sleep better' },
  { id: 'sleep', name: 'Sleep better', sub: 'Build a calm bedtime routine' },
];

export default function Onboarding() {
  const { setProfile, state } = useStore();
  const p0 = state.profile;
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal>(p0?.goal ?? 'gain');
  const [sex, setSex] = useState<'male' | 'female'>(p0?.sex ?? 'male');
  const [age, setAge] = useState(p0 ? String(p0.age) : '');
  const [height, setHeight] = useState(p0 ? String(p0.height) : '');
  const [weight, setWeight] = useState(p0 ? String(p0.weight) : '');
  const [target, setTarget] = useState(p0 ? String(p0.target) : '');
  const [activity, setActivity] = useState<0 | 1 | 2>(p0?.activity ?? 2);
  const [pace, setPace] = useState<0 | 1>(p0?.pace ?? 0);

  const n = (v: string) => parseFloat(v.replace(',', '.'));
  const detailsOk = [age, height, weight].every((v) => n(v) > 0) && (goal !== 'gain' || n(target) > n(weight));
  const profile: Profile | null = detailsOk
    ? { goal, sex, age: n(age), height: n(height), weight: n(weight), target: n(target) || n(weight), activity, pace }
    : null;
  const t = profile ? targets(profile) : null;
  const weeks = profile ? weeksToGoal(profile) : null;
  const totalSteps = goal === 'gain' ? 4 : 3;

  const next = () => {
    if (step === 2 && goal !== 'gain') return setStep(4);
    if (step < 4) return setStep(step + 1);
    if (profile) { setProfile(profile); router.replace('/connect'); }
  };
  const back = () => setStep(step === 4 && goal !== 'gain' ? 2 : Math.max(1, step - 1));
  const canNext = step !== 2 || detailsOk;
  const shown = goal !== 'gain' && step === 4 ? 3 : step;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable accessibilityLabel="Back" onPress={back} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E3EAE3', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20, color: C.ink }}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}><Bar value={shown / totalSteps} /></View>
        <Muted>{shown} / {totalSteps}</Muted>
      </View>

      {step === 1 && (
        <>
          <H1>What's your main goal?</H1>
          <Muted style={{ fontSize: 15 }}>We'll build your daily targets and habits around it.</Muted>
          {GOALS.map((g) => <Chip key={g.id} label={g.name} sub={g.sub} on={goal === g.id} onPress={() => setGoal(g.id)} />)}
        </>
      )}

      {step === 2 && (
        <>
          <H1>About you</H1>
          <Muted style={{ fontSize: 15 }}>Used only to calculate your targets. Stored on this phone.</Muted>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Field label="Age" keyboardType="number-pad" value={age} onChangeText={setAge} placeholder="28" />
            <Field label="Height (cm)" keyboardType="number-pad" value={height} onChangeText={setHeight} placeholder="172" />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Field label="Weight (kg)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} placeholder="62" />
            {goal === 'gain' || goal === 'lose' ? (
              <Field label="Target (kg)" keyboardType="decimal-pad" value={target} onChangeText={setTarget} placeholder="68" />
            ) : <View style={{ flex: 1 }} />}
          </View>
          <Muted>Body type for the formula</Muted>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}><Chip label="Male" on={sex === 'male'} onPress={() => setSex('male')} /></View>
            <View style={{ flex: 1 }}><Chip label="Female" on={sex === 'female'} onPress={() => setSex('female')} /></View>
          </View>
          <Muted>How active is your day?</Muted>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ACTIVITY.map((a, i) => (
              <View key={a.name} style={{ flex: 1 }}><Chip label={a.name} on={activity === i} onPress={() => setActivity(i as 0 | 1 | 2)} /></View>
            ))}
          </View>
          <Muted>On your feet all shift (like restaurant work) counts as Active.</Muted>
          {goal === 'gain' && n(target) > 0 && n(target) <= n(weight) ? <Text style={{ color: C.orange, fontWeight: '600' }}>Target should be higher than your current weight.</Text> : null}
        </>
      )}

      {step === 3 && (
        <>
          <H1>Pick your pace</H1>
          <Muted style={{ fontSize: 15 }}>Slower gain means more muscle and less fat.</Muted>
          {PACE.map((pc, i) => {
            const w = profile ? weeksToGoal({ ...profile, pace: i as 0 | 1 }) : null;
            return <Chip key={pc.name} label={pc.name} sub={`+${pc.perWeek} kg per week${w ? ` · ~${w} weeks` : ''}`} on={pace === i} onPress={() => setPace(i as 0 | 1)} />;
          })}
        </>
      )}

      {step === 4 && t && profile && (
        <>
          <H1>Your plan is ready</H1>
          {weeks ? (
            <Card style={{ backgroundColor: C.green }}>
              <Text style={{ color: '#D6E8DC', fontWeight: '600' }}>{profile.weight} kg → {profile.target} kg</Text>
              <Text style={{ color: '#FFF', fontSize: 34, fontWeight: '700' }}>~{weeks} weeks</Text>
              <Text style={{ color: '#E6F0E9' }}>at +{PACE[pace].perWeek} kg per week</Text>
            </Card>
          ) : null}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={{ flex: 1 }}>
              <Muted>Daily calories</Muted>
              <Num>{fmt(t.kcal)}</Num>
              <Muted style={{ fontSize: 11 }}>{fmt(t.maintenance)} maintenance{goal === 'gain' ? ` + ${PACE[pace].surplus}` : goal === 'lose' ? ' − 400' : ''}</Muted>
            </Card>
            <Card style={{ flex: 1 }}>
              <Muted>Daily protein</Muted>
              <Num>{t.protein} g</Num>
              <Muted style={{ fontSize: 11 }}>{goal === 'gain' ? '1.8' : goal === 'lose' ? '2.0' : '1.6'} g per kg body weight</Muted>
            </Card>
          </View>
          <Muted>Estimates from the Mifflin-St Jeor formula. The app adjusts them as you log your weight.</Muted>
        </>
      )}

      <View style={{ gap: 8, marginTop: 8 }}>
        <Button title={step === 4 ? 'Start my plan' : 'Continue'} onPress={next} disabled={!canNext} />
      </View>
    </Screen>
  );
}
