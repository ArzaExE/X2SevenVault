import { Audio } from 'expo-av';
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../../components/Button";

const SCANS_DIR = FileSystem.documentDirectory + 'scans/';
const RECORD_DURATION = 10000;

export default function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef(0);
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions()

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
    )
  }

  // const startRecording = async (): Promise<string | undefined> => {
  //   if (!cameraRef.current || isRecording) return;

  //   setIsRecording(true);

  //   // Stop automatico dopo 5 secondi
  //   timerRef.current = setTimeout(() => stopRecording(), RECORD_DURATION);

  //   try {
  //     const video = await cameraRef.current.recordAsync();
  //     if (!video) return;
  //     const destUri = await saveVideo(video.uri);
  //     return destUri;
  //   } catch (err) {
  //     console.error('Errore registrazione:', err);
  //   } finally {
  //     setIsRecording(false);
  //   }
  // };
  
  // const stopRecording = () => {
  //   clearTimeout(timerRef.current);
  //   cameraRef.current?.stopRecording();
  // };

  // const saveVideo = async (tempUri: string): Promise<string> =>  {
  //   const destUri = SCANS_DIR + `scan_${Date.now()}.mp4`;
  //   await FileSystem.moveAsync({ from: tempUri, to: destUri });
  //   return destUri;
  // };

  // const extractFrames = async (videoUri: string) => {
  //   const outputDir = SCANS_DIR + 'frames/';
  //   await FileSystem.makeDirectoryAsync(outputDir, { intermediates: true });

  //   // Estrai 1 frame ogni secondo
  //   await FFmpegKit.execute(
  //     `-i ${videoUri} -vf fps=1 ${outputDir}frame_%03d.jpg`
  //   );

  //   const frames = await FileSystem.readDirectoryAsync(outputDir);
  //   console.log('Frame estratti:', frames);
  // };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync();
    if (!photo) return;

    const destUri = SCANS_DIR + `scan_${Date.now()}.jpg`;
    await FileSystem.moveAsync({ from: photo.uri, to: destUri });
    console.log('Foto salvata:', destUri);
  };

 function scan() {
    takePhoto();
    // await extractFrames(scanUri);
    // router.push({
    //   pathname: "../object-details",
    //   // params: { code: "WH-BOX-3921" }
    // })
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" mode="picture" />
      {/* <CameraView style={styles.camera} /> */}

      <View style={styles.controls}>
        <Button title="Object Scan" onPress={scan} />
      </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera: {
    flex: 1
  },
  controls: {
    padding: 20
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
})