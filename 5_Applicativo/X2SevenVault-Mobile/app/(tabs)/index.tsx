import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import Button from '../../components/Button';
import useTFLite from '../../hooks/useTFLite';

export default function ScannerScreen() {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back'); // ✅ Fix: useCameraDevice invece di useCameraDevices().back
  const format = useCameraFormat(device, [
    { fps: 30 }
  ]); // ✅ Fix: useCameraFormat per selezionare il formato con 2 FPS
  const frameCount = useSharedValue(0);

  const { model, LABELS, THRESHOLD } = useTFLite();
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { hasPermission, requestPermission } = useCameraPermission(); // ✅ Fix: useCameraPermission invece di useCameraPermissions

  useEffect(() => {
    requestPermission();
  }, []);


const processFrame = async (buffer: number[]) => {
  if (!model) return;

  const tensor = new Uint8Array(buffer);
  const outputs = await model.run([tensor]); // ✅ await su JS thread

  console.log('outputs[0] (boxes):', Array.from(outputs[0] ?? []));
  console.log('outputs[1] (scores):', Array.from(outputs[1] ?? []));
  console.log('outputs[2] (classes):', Array.from(outputs[2] ?? []));

  const det = parseYOLO(outputs, LABELS, THRESHOLD);
  setDetections(det);
};

const frameProcessor = useFrameProcessor((frame: Frame) => {
  'worklet';

  frameCount.value = (frameCount.value + 1) % 15;
  if (frameCount.value !== 0) return;

  // ✅ Converti il buffer in plain array e passa tutto a JS thread
  const buffer = frame.toArrayBuffer();
  const plainArray = Array.from(new Uint8Array(buffer));
  runOnJS(processFrame)(plainArray);

}, [frameCount]);

  if (!device || !hasPermission) { // ✅ Fix: hasPermission invece di permission
    return (
      <View style={styles.center}>
        <Text>No camera permission or device</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        format={format}   // ✅ aggiunto
      />

      {detections.length > 0 && (
        <View style={styles.overlay}>
          {detections.map((d, i) => (
            <Text key={i} style={styles.detectionText}>
              {d.label} — {(d.confidence * 100).toFixed(1)}%
            </Text>
          ))}
        </View>
      )}

      <View style={styles.controls}>
        <Button
          title={loading ? 'Analisi in corso...' : 'Object Scan'}
          onPress={() => console.log('Scanner attivo')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },
  detectionText: { color: '#fff', fontSize: 16, marginBottom: 4 },
  controls: { position: 'absolute', bottom: 30, width: '100%', paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});