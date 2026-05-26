import * as FileSystem from 'expo-file-system/legacy';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Result = { ok: boolean; message: string } | null;

export default function FileSystemScreen() {
  const [result, setResult] = useState<Result>(null);

  const runTest = async () => {
    try {
      const content = 'studigital-test-' + Date.now();
      const dir = FileSystem.cacheDirectory + 'sandbox-test/';
      const file = dir + 'hello.txt';

      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      await FileSystem.writeAsStringAsync(file, content);
      const read = await FileSystem.readAsStringAsync(file);
      await FileSystem.deleteAsync(dir, { idempotent: true });

      if (read === content) {
        setResult({ ok: true, message: `Write → Read → Delete: OK\n"${content}"` });
      } else {
        setResult({ ok: false, message: 'Read content did not match written content.' });
      }
    } catch (e: any) {
      setResult({ ok: false, message: e.message });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>File System</Text>
      <Text style={styles.desc}>
        Creates a temp directory in cache, writes a string, reads it back, then deletes it.
        Uses expo-file-system/legacy (stable async API).
      </Text>
      <Pressable style={styles.button} onPress={runTest}>
        <Text style={styles.buttonText}>Run Test</Text>
      </Pressable>
      {result && (
        <View style={[styles.result, result.ok ? styles.pass : styles.fail]}>
          <Text style={styles.resultText}>{result.ok ? 'PASS' : 'FAIL'}</Text>
          <Text style={styles.resultDetail}>{result.message}</Text>
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
  result: { borderRadius: 8, padding: 16, gap: 8 },
  pass: { backgroundColor: '#e8f5e9' },
  fail: { backgroundColor: '#fce4ec' },
  resultText: { fontWeight: 'bold', fontSize: 16 },
  resultDetail: { fontSize: 13, fontFamily: 'monospace' },
});
