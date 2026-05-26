import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const TESTS = [
  { route: '/camera', label: 'Camera', desc: 'Photo capture for notes & handwriting' },
  { route: '/file-system', label: 'File System', desc: 'Store raw media before upload' },
  { route: '/network', label: 'Network', desc: 'Detect online / offline state' },
  { route: '/sqlite', label: 'SQLite', desc: 'Append-only local capture queue' },
  { route: '/background-fetch', label: 'Background Fetch', desc: 'Sync queue when connectivity restores' },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Studigital Hardware Tests</Text>
      <Text style={styles.subtitle}>Tap a test to verify the API on this device.</Text>
      {TESTS.map((t) => (
        <Pressable
          key={t.route}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push(t.route as any)}
        >
          <Text style={styles.cardLabel}>{t.label}</Text>
          <Text style={styles.cardDesc}>{t.desc}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.7,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
});
