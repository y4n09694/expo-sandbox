import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TASK = 'sandbox-background-sync';

TaskManager.defineTask(TASK, async () => {
  console.log('[background-sync] task fired at', new Date().toISOString());
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export default function BackgroundFetchScreen() {
  const [status, setStatus] = useState<string>('—');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const s = await BackgroundFetch.getStatusAsync();
    const isReg = await TaskManager.isTaskRegisteredAsync(TASK);
    const label = {
      [BackgroundFetch.BackgroundFetchStatus.Restricted]: 'Restricted (parental controls)',
      [BackgroundFetch.BackgroundFetchStatus.Denied]: 'Denied — enable in Settings',
      [BackgroundFetch.BackgroundFetchStatus.Available]: 'Available',
    }[s] ?? 'Unknown';
    setStatus(label);
    setRegistered(isReg);
  };

  const register = async () => {
    await BackgroundFetch.registerTaskAsync(TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
    await checkStatus();
  };

  const unregister = async () => {
    await BackgroundFetch.unregisterTaskAsync(TASK);
    await checkStatus();
  };

  const isAvailable = status === 'Available';

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Background Fetch</Text>
      <Text style={styles.desc}>
        Registers a background task that will fire when the OS allows it (minimum 15 min on iOS).
        Studigital uses this to sync the capture queue when connectivity restores.
      </Text>
      <View style={[styles.statusCard, isAvailable ? styles.pass : styles.warn]}>
        <Text style={styles.statusLabel}>System status</Text>
        <Text style={styles.statusValue}>{status}</Text>
        <Text style={styles.statusLabel}>Task registered</Text>
        <Text style={styles.statusValue}>{registered ? 'Yes' : 'No'}</Text>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={register} disabled={registered}>
          <Text style={styles.buttonText}>Register Task</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={unregister} disabled={!registered}>
          <Text style={[styles.buttonText, styles.secondaryText]}>Unregister</Text>
        </Pressable>
      </View>
      <Text style={styles.note}>
        Note: iOS does not let you trigger background fetch manually — the OS controls when it fires.
        PASS = status Available + task registered without errors.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#555', lineHeight: 20 },
  statusCard: { borderRadius: 8, padding: 16, gap: 4 },
  pass: { backgroundColor: '#e8f5e9' },
  warn: { backgroundColor: '#fff3e0' },
  statusLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  statusValue: { fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, backgroundColor: '#1a73e8', borderRadius: 8, padding: 14, alignItems: 'center' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryText: { color: '#333' },
  note: { fontSize: 12, color: '#888', lineHeight: 18 },
});
