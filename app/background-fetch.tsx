import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TASK = 'sandbox-background-sync';

// Task definition must be at module scope (top level), not inside a component.
TaskManager.defineTask(TASK, async () => {
  console.log('[background-sync] fired at', new Date().toISOString());
  return BackgroundTask.BackgroundTaskResult.Success;
});

type Status = {
  available: boolean;
  statusLabel: string;
  registered: boolean;
  expoGoBlocked: boolean;
};

export default function BackgroundFetchScreen() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const s = await BackgroundTask.getStatusAsync();
      const registered = await TaskManager.isTaskRegisteredAsync(TASK);
      const available = s === BackgroundTask.BackgroundTaskStatus.Available;
      const statusLabel = {
        [BackgroundTask.BackgroundTaskStatus.Restricted]: 'Restricted (parental controls)',
        [BackgroundTask.BackgroundTaskStatus.Denied]: 'Denied — enable Background App Refresh in Settings',
        [BackgroundTask.BackgroundTaskStatus.Available]: 'Available',
      }[s] ?? 'Unknown';
      setStatus({ available, statusLabel, registered, expoGoBlocked: false });
      setError(null);
    } catch (e: any) {
      const msg: string = e.message ?? '';
      const expoGoBlocked = msg.includes('UIBackgroundModes') || msg.includes('not been configured');
      setStatus({ available: false, statusLabel: 'Not available', registered: false, expoGoBlocked });
      setError(expoGoBlocked ? null : msg);
    }
  };

  const register = async () => {
    try {
      await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 15 * 60 });
      await checkStatus();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const unregister = async () => {
    try {
      await BackgroundTask.unregisterTaskAsync(TASK);
      await checkStatus();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Background Task</Text>
      <Text style={styles.desc}>
        Registers a background task that fires when the OS allows (min 15 min on iOS).
        Studigital uses this to sync the capture queue when connectivity restores.
      </Text>

      {status?.expoGoBlocked && (
        <View style={styles.limitationCard}>
          <Text style={styles.limitationTitle}>Not available in Expo Go</Text>
          <Text style={styles.limitationBody}>
            Background tasks require a native build with{' '}
            <Text style={styles.code}>UIBackgroundModes = [fetch]</Text> in Info.plist.
            {'\n\n'}This is configured automatically by the{' '}
            <Text style={styles.code}>expo-background-task</Text> plugin when you run{' '}
            <Text style={styles.code}>eas build</Text> or{' '}
            <Text style={styles.code}>npx expo run:ios</Text>.
            {'\n\n'}You can review the task code in{' '}
            <Text style={styles.code}>app/background-fetch.tsx</Text> —
            it will work correctly in a dev build.
          </Text>
        </View>
      )}

      {status && !status.expoGoBlocked && (
        <>
          <View style={[styles.statusCard, status.available ? styles.pass : styles.warn]}>
            <Text style={styles.statusLabel}>System status</Text>
            <Text style={styles.statusValue}>{status.statusLabel}</Text>
            <Text style={styles.statusLabel}>Task registered</Text>
            <Text style={styles.statusValue}>{status.registered ? 'Yes ✓' : 'No'}</Text>
          </View>
          <View style={styles.row}>
            <Pressable style={styles.button} onPress={register} disabled={status.registered}>
              <Text style={styles.buttonText}>Register Task</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.secondary]} onPress={unregister} disabled={!status.registered}>
              <Text style={[styles.buttonText, styles.secondaryText]}>Unregister</Text>
            </Pressable>
          </View>
          <Text style={styles.note}>
            PASS = status Available + task registered. iOS controls when the task actually fires.
          </Text>
        </>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#555', lineHeight: 20 },
  limitationCard: { backgroundColor: '#fff8e1', borderRadius: 8, padding: 16, gap: 8, borderLeftWidth: 4, borderLeftColor: '#f9a825' },
  limitationTitle: { fontWeight: 'bold', fontSize: 15, color: '#e65100' },
  limitationBody: { fontSize: 13, color: '#555', lineHeight: 20 },
  code: { fontFamily: 'monospace', backgroundColor: '#f5f5f5', color: '#333' },
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
  errorCard: { backgroundColor: '#fce4ec', borderRadius: 8, padding: 12 },
  errorText: { fontSize: 13, color: '#c62828', fontFamily: 'monospace' },
});
