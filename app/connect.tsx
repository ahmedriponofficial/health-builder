import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { connectHealth, healthAvailable, readToday } from '../src/health';
import { useStore } from '../src/store';
import { C } from '../src/theme';
import { Button, Card, fmt, H1, Muted, Num, Screen } from '../src/ui';

export default function Connect() {
  const { setHealthConnected, state } = useStore();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [data, setData] = useState<null | { steps: number; activeKcal: number; km: number; weight?: number }>(null);

  const connect = async () => {
    setBusy(true); setMsg('');
    const ok = await connectHealth();
    if (!ok) {
      setMsg(healthAvailable()
        ? 'Apple Health could not be connected. You can allow access in iPhone Settings › Health › Data Access.'
        : 'Apple Health only works in the installed iPhone app, not in Expo Go. You can connect later.');
      setBusy(false);
      return;
    }
    setHealthConnected(true);
    setData(await readToday());
    setBusy(false);
  };

  return (
    <Screen>
      {!data ? (
        <>
          <H1>Connect your iPhone data</H1>
          <Muted style={{ fontSize: 15, lineHeight: 22 }}>Your iPhone already counts your steps. Connect Apple Health so you never have to type them.</Muted>
          <Card>
            {[
              ['Steps', 'Daily movement'],
              ['Active energy', 'Calories burned by movement'],
              ['Walking distance', 'How much you move on shift days'],
              ['Weight', 'Track your progress automatically'],
            ].map(([a, b]) => (
              <View key={a} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2EE' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.ink }}>{a}</Text>
                <Muted>{b}</Muted>
              </View>
            ))}
          </Card>
          <Muted>Read only. You choose what to share on the next screen, and can change it any time in iPhone Settings › Health.</Muted>
          {msg ? <Text style={{ color: C.orange, fontWeight: '600', lineHeight: 20 }}>{msg}</Text> : null}
          <Button title={busy ? 'Connecting…' : 'Connect Apple Health'} onPress={connect} disabled={busy} />
          <Button title={state.profile ? 'Not now' : 'Skip'} variant="ghost" onPress={() => router.replace('/today')} />
        </>
      ) : (
        <>
          <H1>Apple Health connected</H1>
          <Muted>Updates every time you open the app.</Muted>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={{ flex: 1 }}><Muted>Steps today</Muted><Num>{fmt(data.steps)}</Num></Card>
            <Card style={{ flex: 1 }}><Muted>Active energy</Muted><Num>{fmt(data.activeKcal)} kcal</Num></Card>
          </View>
          <Button title="Go to Today" onPress={() => router.replace('/today')} />
        </>
      )}
    </Screen>
  );
}
