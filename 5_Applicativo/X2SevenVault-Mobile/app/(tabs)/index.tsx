import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../../components/Button";

const SCANS_DIR = FileSystem.documentDirectory + 'scans/';
const RECORD_DURATION = 5000;

export default function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<any>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
    Audio.requestPermissionsAsync();
    FileSystem.makeDirectoryAsync(SCANS_DIR, { intermediates: true });
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>No camera permission</Text>
      </View>
    );
  }

  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    timerRef.current = setTimeout(() => stopRecording(), RECORD_DURATION);
    try {
      const video = await cameraRef.current.recordAsync();
      if (!video) return;
      await saveVideo(video.uri);
    } catch (err) {
      console.error('Errore registrazione:', err);
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    clearTimeout(timerRef.current);
    cameraRef.current?.stopRecording();
  };

  const saveVideo = async (tempUri: string) => {
    const destUri = SCANS_DIR + `scan_${Date.now()}.mp4`;
    await FileSystem.moveAsync({ from: tempUri, to: destUri });
    console.log('Video salvato:', destUri);
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="video" />
      <View style={styles.controls}>
        <Button
          title={isRecording ? "Registrazione..." : "Avvia Scan"}
          onPress={startRecording}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});