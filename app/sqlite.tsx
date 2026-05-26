import * as SQLite from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Row = { id: number; text: string; created_at: string };
type Result = { ok: boolean; rows: Row[]; error?: string } | null;

export default function SQLiteScreen() {
  const [result, setResult] = useState<Result>(null);

  const runTest = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('sandbox-test.db');

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS captures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);

      await db.runAsync(
        'INSERT INTO captures (text, created_at) VALUES (?, ?)',
        ['test-capture-' + Date.now(), new Date().toISOString()]
      );

      const rows = await db.getAllAsync<Row>('SELECT * FROM captures ORDER BY id DESC LIMIT 5');
      await db.closeAsync();

      setResult({ ok: true, rows });
    } catch (e: any) {
      setResult({ ok: false, rows: [], error: e.message });
    }
  };

  const clear = async () => {
    try {
      await SQLite.deleteDatabaseAsync('sandbox-test.db');
      setResult(null);
    } catch (e: any) {
      setResult({ ok: false, rows: [], error: e.message });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>SQLite</Text>
      <Text style={styles.desc}>
        Opens a database, creates a captures table, inserts a row, and reads back the last 5 rows.
        Mimics the Studigital local capture queue.
      </Text>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={runTest}>
          <Text style={styles.buttonText}>Insert Row</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondary]} onPress={clear}>
          <Text style={[styles.buttonText, styles.secondaryText]}>Clear DB</Text>
        </Pressable>
      </View>
      {result && (
        <View style={[styles.result, result.ok ? styles.pass : styles.fail]}>
          <Text style={styles.resultText}>{result.ok ? 'PASS' : 'FAIL'}</Text>
          {result.error && <Text style={styles.error}>{result.error}</Text>}
          {result.rows.map((r) => (
            <Text key={r.id} style={styles.rowText}>
              #{r.id} — {r.text}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  heading: { fontSize: 20, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#555', lineHeight: 20 },
  row: { flexDirection: 'row', gap: 12 },
  button: { flex: 1, backgroundColor: '#1a73e8', borderRadius: 8, padding: 14, alignItems: 'center' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryText: { color: '#333' },
  result: { borderRadius: 8, padding: 16, gap: 6 },
  pass: { backgroundColor: '#e8f5e9' },
  fail: { backgroundColor: '#fce4ec' },
  resultText: { fontWeight: 'bold', fontSize: 16 },
  rowText: { fontSize: 12, fontFamily: 'monospace', color: '#333' },
  error: { fontSize: 13, color: '#c62828' },
});
