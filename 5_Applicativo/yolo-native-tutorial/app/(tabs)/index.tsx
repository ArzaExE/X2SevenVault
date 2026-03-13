import ExpoYolo from "@/modules/expo-yolo";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Button, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Rect, Svg } from "react-native-svg";

const LABELS = ['airpods', 'bottle', 'eletric_socket', 'helmet', 'micro'];
const NUM_BOXES = 8400;
const THRESHOLD = 0.7;
const IOU_THRESHOLD = 0.45;

interface Detection {
  classId: string;
  confidence: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
}

// NMS - rimuove box sovrapposti
function iou(a: Detection, b: Detection): number {
  const ax2 = a.x1 + a.width;
  const ay2 = a.y1 + a.height;
  const bx2 = b.x1 + b.width;
  const by2 = b.y1 + b.height;

  const interX1 = Math.max(a.x1, b.x1);
  const interY1 = Math.max(a.y1, b.y1);
  const interX2 = Math.min(ax2, bx2);
  const interY2 = Math.min(ay2, by2);

  const interArea = Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1);
  const aArea = a.width * a.height;
  const bArea = b.width * b.height;

  return interArea / (aArea + bArea - interArea);
}

function nms(detections: Detection[]): Detection[] {
  const sorted = [...detections].sort((a, b) => b.confidence - a.confidence);
  const result: Detection[] = [];

  for (const det of sorted) {
    if (!result.some(r => r.classId === det.classId && iou(r, det) > IOU_THRESHOLD)) {
      result.push(det);
    }
  }
  return result;
}

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    return () => {
      ExpoYolo.closeInterpreter();
    };
  }, []);

  useEffect(() => {
    const doInference = async () => {
      if (!image) return;

      const result = await ExpoYolo.performInference(image);
      const raw: Detection[] = [];

      // Output shape: [1, 9, 8400] → attribute-first
      // result è flat: [cx_0, cx_1, ..., cy_0, cy_1, ..., w_0, ..., h_0, ..., class0_0, ..., class4_0, ...]
      for (let i = 0; i < NUM_BOXES; i++) {
        const cx = result[0 * NUM_BOXES + i];
        const cy = result[1 * NUM_BOXES + i];
        const w  = result[2 * NUM_BOXES + i];
        const h  = result[3 * NUM_BOXES + i];

        // Trova classe con score massimo
        let maxScore = 0;
        let maxClass = 0;
        for (let c = 0; c < LABELS.length; c++) {
          const score = result[(4 + c) * NUM_BOXES + i];
          if (score > maxScore) {
            maxScore = score;
            maxClass = c;
          }
        }

        if (maxScore < THRESHOLD) continue;

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
      console.log('Rilevamenti dopo NMS:', filtered);
      setDetections(filtered);
    };

    doInference();
  }, [image]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Button title="Scegli immagine" onPress={pickImage} />
      <View style={{ height: "65%" }}>
        {image && (
          <View>
            <Image
              source={{ uri: image }}
              style={{ height: "100%" }}
              resizeMode="contain"
              onLayout={(event) => {
                setImageLayout({
                  width: event.nativeEvent.layout.width,
                  height: event.nativeEvent.layout.height,
                });
              }}
            />
            {!!imageLayout.height && !!imageLayout.width && (
              <Svg
                height={imageLayout.height}
                width={imageLayout.width}
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                {detections.map((item, index) => (
                  <Rect
                    key={index}
                    x={item.x1 * imageLayout.width}
                    y={item.y1 * imageLayout.height}
                    stroke="red"
                    strokeWidth={2}
                    width={item.width * imageLayout.width}
                    height={item.height * imageLayout.height}
                    fill="none"
                  />
                ))}
              </Svg>
            )}
          </View>
        )}
      </View>
      <View style={{ padding: 10 }}>
        {detections.length ? (
          detections.map((item, index) => (
            <Text key={index} style={{ fontSize: 18 }}>
              {item.classId} — {(item.confidence * 100).toFixed(1)}%
            </Text>
          ))
        ) : (
          <Text>Nessun oggetto rilevato</Text>
        )}
      </View>
    </SafeAreaView>
  );
}