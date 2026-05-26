import * as BackgroundTask from 'expo-background-task';
import * as Network from 'expo-network';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TASK = 'sandbox-background-sync';

// The actual task logic — extracted so it can be called directly for simulation.
async function runSyncLogic(): Promise<string[]> {
  const lines: string[] = [];
  lines.push(`[${new Date().toISOString()}] Task started`);

  const net = await Network.getNetworkStateAsync();
  lines.push(`Network: ${net.type}, connected=${net.isConnected}`);

  if (!net.isConnected) {
    lines.push('Offline — skipping sync, will retry next firing.');
    return lines;
  }

  // Simulate reading capture queue and uploading.
  lines.push('Reading local capture queue…');
  await new Promise(r => setTimeout(r, 400));
  lines.push('Found 3 pending captures (simulated)');
  await new Promise(r => setTimeout(r, 400));
  lines.push('Uploaded 3 captures → server (simulated)');
  lines.push('Queue cleared.');
  lines.push('Task complete ✓');
  return lines;
}

// Must be defined at module scope.
TaskManager.defineTask(TASK, async () => {
  await runSyncLogic();
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
  const [simLog, setSimLog] = useState<string[] | null>(null);
  const [simRunning, setSimRunning] = useState(false);

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
    } catch (e: any) {
      const blocked = (e.message ?? '').includes('UIBackgroundModes') || (e.message ?? '').includes('not been configured');
      setStatus({ available: false, statusLabel: 'Not available', registered: false, expoGoBlocked: blocked });
    }
  };

  const simulate = async () => {
    setSimRunning(true);
    setSimLog(['Running…']);
    const lines = await runSyncLogic();
    setSimLog(lines);
    setSimRunning(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Background Task</Text>
      <Text style={styles.desc}>
        Syncs the capture queue when the OS fires the task (min 15 min on iOS).
        Studigital uses this to upload offline captures when connectivity restores.
      </Text>

      {/* Simulation — always available */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Simulate task logic</Text>
        <Text style={styles.sectionDesc}>
          Runs the sync handler directly — tests your code without waiting for iOS to schedule it.
        </Text>
        <Pressable style={[styles.button, simRunning && styles.buttonDisabled]} onPress={simulate} disabled={simRunning}>
          <Text style={styles.buttonText}>{simRunning ? 'Running…' : 'Run Task Now'}</Text>
        </Pressable>
        {simLog && (
          <View style={styles.logCard}>
            {simLog.map((line, i) => (
              <Text key={i} style={styles.logLine}>{line}</Text>
            ))}
          </View>
        )}
      </View>

      {/* OS scheduling status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OS scheduling</Text>
        {status?.expoGoBlocked ? (
          <View style={styles.limitationCard}>
            <Text style={styles.limitationTitle}>Not available in Expo Go</Text>
            <Text style={styles.limitationBody}>
              Requires a native build with <Text style={styles.code}>UIBackgroundModes = [fetch]</Text> in Info.plist.{'\n\n'}
              See <Text style={styles.code}>GitHub issue #2</Text> for the EAS dev-client build steps.
            </Text>
          </View>
        ) : status ? (
          <View style={[styles.statusCard, status.available ? styles.pass : styles.warn]}>
            <Text style={styles.statusLabel}>System status</Text>
            <Text style={styles.statusValue}>{status.statusLabel}</Text>
            <Text style={styles.statusLabel}>Task registered</Text>
            <Text style={styles.statusValue}>{status.registered ? 'Yes ✓' : 'No'}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#555', lineHeight: 20 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  sectionDesc: { fontSize: 13, color: '#666', lineHeight: 18 },
  button: { backgroundColor: '#1a73e8', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  logCard: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 14, gap: 4 },
  logLine: { color: '#d4d4d4', fontSize: 12, fontFamily: 'monospace' },
  limitationCard: { backgroundColor: '#fff8e1', borderRadius: 8, padding: 16, gap: 8, borderLeftWidth: 4, borderLeftColor: '#f9a825' },
  limitationTitle: { fontWeight: 'bold', fontSize: 15, color: '#e65100' },
  limitationBody: { fontSize: 13, color: '#555', lineHeight: 20 },
  code: { fontFamily: 'monospace', color: '#555' },
  statusCard: { borderRadius: 8, padding: 16, gap: 4 },
  pass: { backgroundColor: '#e8f5e9' },
  warn: { backgroundColor: '#fff3e0' },
  statusLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  statusValue: { fontSize: 15, fontWeight: '600' },
});
