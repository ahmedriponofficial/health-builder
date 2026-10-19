import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useStore } from '../src/store';
import { C } from '../src/theme';

export default function Index() {
  const { ready, state } = useStore();
  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}><ActivityIndicator color={C.green} /></View>;
  return <Redirect href={state.profile ? '/today' : '/onboarding'} />;
}
