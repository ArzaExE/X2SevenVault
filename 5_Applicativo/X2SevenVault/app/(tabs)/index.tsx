import ExpoYolo from "@/modules/expo-yolo";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const LABELS = process.env.EXPO_PUBLIC_LABELS?.split(",") ?? []; // ID delle classi (ai_class_ids)
const NUM_BOXES = Number(process.env.EXPO_PUBLIC_NUM_BOXES); // Numero massimo di box restituiti dal modello
const THRESHOLD = Number(process.env.EXPO_PUBLIC_THRESHOLD); // Soglia di confidenza minima per considerare una rilevazione valida
const IOU_THRESHOLD = Number(process.env.EXPO_PUBLIC_IOU_THRESHOLD); // Soglia di sovrapposizione (IoU) per la non-maxima suppression

interface Detection {
  classId: string;
  confidence: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
}

function iou(a: Detection, b: Detection): number {
  const ax2 = a.x1 + a.width;
  const ay2 = a.y1 + a.height;
  const bx2 = b.x1 + b.width;
  const by2 = b.y1 + b.height;
  // Calcola area di intersezione
  const interX1 = Math.max(a.x1, b.x1);
  const interY1 = Math.max(a.y1, b.y1);
  const interX2 = Math.min(ax2, bx2);
  const interY2 = Math.min(ay2, by2);
  const interArea =
    Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1);
  // IoU = intersezione / unione
  const aArea = a.width * a.height;
  const bArea = b.width * b.height;
  return interArea / (aArea + bArea - interArea);
}

function nms(detections: Detection[]): Detection[] {
  // Ordina per confidenza decrescente. ...copia di detections
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence); // Risultato positivo b > a, ordine decrescente
  const result: Detection[] = [];
  for (const det of sorted) {
    if (
      // Scarta se già coperto da un rilevamento migliore
      !result.some( //.some() restituisce true se almeno un elemento soddisfa la condizione
        (r) => r.classId === det.classId && iou(r, det) > IOU_THRESHOLD
      )
    ) {
      result.push(det);
    }
  }
  return result;
}

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  const interpreterInitialized = useRef(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    return () => {
      ExpoYolo.closeInterpreter();
    };
  }, []);

  const captureAndDetect = async () => {
    if (!cameraRef.current || isProcessing) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      if (!photo?.uri) return;

      interpreterInitialized.current = true;
      const result = await ExpoYolo.performInference(photo.uri);

      const raw: Detection[] = [];

      for (let i = 0; i < NUM_BOXES; i++) {
        const cx = result[0 * NUM_BOXES + i]; // Centro X del box
        const cy = result[1 * NUM_BOXES + i]; // Centro Y del box
        const w = result[2 * NUM_BOXES + i]; // Larghezza del box
        const h = result[3 * NUM_BOXES + i]; // Altezza del box

        // Punteggi per ogni classe
        let maxScore = 0;
        let maxClass = 0;
        for (let c = 0; c < LABELS.length; c++) {
          // Parte da 4 perchè i primi 4 valori sono cx, cy, w, h
          const score = result[(4 + c) * NUM_BOXES + i];
          if (score > maxScore) {
            maxScore = score;
            maxClass = c;
          }
        }

        if (maxScore < THRESHOLD) continue;

        // Assegnazione dei risultati all'interfaccia Detection
        raw.push({
          classId: LABELS[maxClass],
          confidence: maxScore,
          x1: cx - w / 2,
          y1: cy - h / 2,
          width: w,
          height: h,
        });
      }

      const filtered = nms(raw);

      if (filtered.length === 0) {
        Alert.alert(
          "No object detected",
          "Try to frame the object better and keep the camera at a reasonable distance."
        );
        return;
      }

      const best = filtered[0]; // confideneza più alta dopo NMS
      router.push({
        pathname: "/modal",
        params: {
          classId: best.classId,
          confidence: best.confidence.toString(),
          allDetections: JSON.stringify(filtered),
        },
      });
    } catch (e) {
      Alert.alert("Error", "Unable to perform detection.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#00D4E8" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={48} color="#00D4E8" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSub}>
          Camera permission is required to detect objects.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/images/adaptive-icon.png")}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>X2SevenVault</Text>
            <Text style={styles.headerSub}>Smart Warehouse Scanner</Text>
          </View>

        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.headerBtn} onPress={() => router.push("/info")}>
            <Ionicons name="information-circle-outline" size={20} color="#718096" />
          </Pressable>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
        />

        {/* Processing overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color="#00D4E8" />
            <Text style={styles.processingText}>Analyzing...</Text>
          </View>
        )}
      </View>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 14 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.shutterOuter,
            pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
            isProcessing && { opacity: 0.5 },
          ]}
          onPress={captureAndDetect}
          disabled={isProcessing}
        >
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
  },
  centered: {
    flex: 1,
    backgroundColor: "#0D1117",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  permissionSub: {
    color: "#718096",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  permissionBtn: {
    marginTop: 8,
    backgroundColor: "#00D4E8",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: "#0D1117",
    fontWeight: "700",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#0D1117",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#00D4E81A",
    borderWidth: 1,
    borderColor: "#00D4E830",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerSub: {
    color: "#00D4E8",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "#2D3748",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0D111799",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  processingText: {
    color: "#00D4E8",
    fontSize: 14,
    fontWeight: "500",
  },
  bottomBar: {
    backgroundColor: "#0D1117",
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#161B22",
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    borderWidth: 3,
    borderColor: "#0D1117",
  },
  cameraLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cameraLabelText: {
    color: "#718096",
    fontSize: 12,
    fontWeight: "500",
  },
});