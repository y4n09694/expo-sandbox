import * as Network from 'expo-network';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type State = Awaited<ReturnType<typeof Network.getNetworkStateAsync>> | null;

export default function NetworkScreen() {
  const [state, setState] = useState<State>(null);

  const check = async () => {
    setState(await Network.getNetworkStateAsync());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Network</Text>
      <Text style={styles.desc}>
        Reads the current network state. Studigital uses this to gate sync — captures only upload when connected.
      </Text>
      <Pressable style={styles.button} onPress={check}>
        <Text style={styles.buttonText}>Check Network</Text>
      </Pressable>
      {state && (
        <View style={[styles.result, state.isConnected ? styles.pass : styles.offline]}>
          <Text style={styles.resultText}>
            {state.isConnected ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Text style={styles.row}>Type: {state.type}</Text>
          <Text style={styles.row}>Internet reachable: {String(state.isInternetReachable)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#555', lineHeight: 20 },
  button: { backgroundColor: '#1a73e8', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  result: { borderRadius: 8, padding: 16, gap: 6 },
  pass: { backgroundColor: '#e8f5e9' },
  offline: { backgroundColor: '#fff3e0' },
  resultText: { fontWeight: 'bold', fontSize: 18 },
  row: { fontSize: 13, color: '#333' },
});
