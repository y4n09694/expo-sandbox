import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.center}><Text>Checking permission…</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.label}>Camera permission required.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const snap = async () => {
    const result = await cameraRef.current?.takePictureAsync({ quality: 0.5, base64: false });
    if (result?.uri) setPhoto(result.uri);
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <>
          <Image source={{ uri: photo }} style={styles.preview} />
          <Text style={styles.pass}>PASS — photo captured</Text>
          <Pressable style={styles.button} onPress={() => setPhoto(null)}>
            <Text style={styles.buttonText}>Retake</Text>
          </Pressable>
        </>
      ) : (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <Pressable style={styles.button} onPress={snap}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  camera: { flex: 1 },
  preview: { flex: 1 },
  pass: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16, textAlign: 'center', padding: 12, backgroundColor: '#fff' },
  label: { fontSize: 15, textAlign: 'center' },
  button: { margin: 16, backgroundColor: '#1a73e8', borderRadius: 8, padding: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
