import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCompleteData } from "../lib/firestore";

const FALLBACK = {
  name: "Unknown Object",
  item_id: "N/A",
  description: "Object not found in the catalog.",
  warehouse_id: "N/A",
  shelf_location: "N/A",
  zone: "N/A",
  level: "N/A",
  weight: "N/A",
  height: "N/A",
  width: "N/A",
};

export default function ModalScreen() {
  const router = useRouter();
  const { classId, confidence } = useLocalSearchParams<{
    classId: string;
    confidence: string;
  }>();

  const [item, setItem] = useState<any>(null);
  const [warehouse, setWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const confidenceValue = parseFloat(confidence ?? "0");
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: confidenceValue,
      duration: 900,
      useNativeDriver: false,
    }).start();

    getCompleteData(classId)
      .then(({ item, warehouse }) => {
        if (!item) return setItem(FALLBACK);
        setItem(item);
        setWarehouse(warehouse);
      })
      .catch(() => setItem(FALLBACK))
      .finally(() => setLoading(false));
  }, [confidenceValue, classId]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
          </Pressable>
          <View style={styles.headerIcon}>
            <Ionicons name="cube-outline" size={20} color="#00D4E8" />
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#00D4E8" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
        </Pressable>
        <View style={styles.headerIcon}>
          <Ionicons name="cube-outline" size={20} color="#00D4E8" />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1 — Detected Object */}
        <View style={styles.card}>
          <View style={styles.itemHeader}>
            <View style={styles.itemIcon}>
              <Ionicons name="cube-outline" size={24} color="#00D4E8" />
            </View>
            <View style={styles.itemTitles}>
              <Text style={styles.itemName}>{item?.name}</Text>
              <Text style={styles.itemSku}>SKU: {item?.item_id}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* AI Confidence */}
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceLeft}>
              <Ionicons name="flash" size={14} color="#00D4E8" />
              <Text style={styles.confidenceLabel}>AI Confidence</Text>
            </View>
            <Text style={styles.confidenceValue}>
              {(confidenceValue * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionBlock}>
            <View style={styles.descriptionLabelRow}>
              <Ionicons name="document-text-outline" size={13} color="#4A5568" />
              <Text style={styles.descriptionLabel}>DESCRIPTION</Text>
            </View>
            <Text style={styles.descriptionText}>{item?.description}</Text>
          </View>
        </View>

        {/* Card 2 — Location */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="location-outline" size={18} color="#E2E8F0" />
            <Text style={styles.cardTitle}>Location Information</Text>
          </View>

          {/* Warehouse */}
          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <Ionicons name="bar-chart-outline" size={18} color="#718096" />
            </View>
            <View>
              <Text style={styles.locationRowLabel}>WAREHOUSE</Text>
              <Text style={styles.locationRowValue}>
                {warehouse?.name ?? "N/A"}
              </Text>
            </View>
          </View>

          {/* Shelf */}
          <View style={[styles.locationRow, styles.locationRowHighlight]}>
            <View style={styles.locationIconCyan}>
              <Ionicons name="grid-outline" size={18} color="#00D4E8" />
            </View>
            <View style={styles.locationRowContent}>
              <Text style={styles.locationRowLabel}>EXACT SHELF LOCATION</Text>
              <Text style={styles.locationRowValueLarge}>
                {item?.shelf_id?.replace(/_/g, " ") ?? "N/A"}
              </Text>
            </View>
            <View style={styles.activeDot} />
          </View>

          {/* Zone + Level */}
          <View style={styles.zoneRow}>
            <View style={styles.zoneBox}>
              <Text style={styles.zoneLabel}>AISLE</Text>
              <Text style={styles.zoneValue}>{item?.aisle_id ?? "N/A"}</Text>
            </View>
            <View style={styles.zoneDivider} />
            <View style={styles.zoneBox}>
              <Text style={styles.zoneLabel}>SHELF</Text>
              <Text style={styles.zoneValue}>{item?.shelf_id ?? "N/A"}</Text>
            </View>
            <View style={styles.zoneDivider} />
            <View style={styles.zoneBox}>
              <Text style={styles.zoneLabel}>QUANTITY</Text>
              <Text style={styles.zoneValue}>{item?.quantity ?? "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Card 3 — Additional Info */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="pricetag-outline" size={18} color="#E2E8F0" />
            <Text style={styles.cardTitle}>Additional Information</Text>
          </View>

          {[
            { label: "Weight", value: item?.physical_properties?.weight?.value, unit: item?.physical_properties?.weight?.unit },
            { label: "Height", value: item?.physical_properties?.height?.value, unit: item?.physical_properties?.height?.unit },
            { label: "Width",  value: item?.physical_properties?.width?.value,  unit: item?.physical_properties?.width?.unit  },
          ].map((row, i, arr) => (
            <View key={row.label}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>
                  {row.value != null ? `${row.value}${row.unit ? ` ${row.unit}` : ""}` : "N/A"}
                </Text>
              </View>
              {i < arr.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.ctaText}>Scan Another Object</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#161B22",
    borderWidth: 1,
    borderColor: "#2D3748",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#00D4E81A",
    borderWidth: 1,
    borderColor: "#00D4E830",
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#161B22",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#21262D",
    padding: 16,
    gap: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#00D4E81A",
    borderWidth: 1,
    borderColor: "#00D4E830",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitles: {
    flex: 1,
  },
  itemName: {
    color: "#E2E8F0",
    fontSize: 20,
    fontWeight: "700",
  },
  itemSku: {
    color: "#718096",
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#21262D",
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  confidenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  confidenceLabel: {
    color: "#00D4E8",
    fontSize: 14,
    fontWeight: "600",
  },
  confidenceValue: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#21262D",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: -4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00D4E8",
    borderRadius: 3,
  },
  descriptionBlock: {
    gap: 6,
  },
  descriptionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  descriptionLabel: {
    color: "#4A5568",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  descriptionText: {
    color: "#A0AEC0",
    fontSize: 13,
    lineHeight: 20,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0D1117",
    borderRadius: 10,
    padding: 12,
  },
  locationRowHighlight: {
    borderWidth: 1,
    borderColor: "#00D4E820",
    backgroundColor: "#00D4E808",
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#21262D",
    alignItems: "center",
    justifyContent: "center",
  },
  locationIconCyan: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#00D4E81A",
    alignItems: "center",
    justifyContent: "center",
  },
  locationRowContent: {
    flex: 1,
  },
  locationRowLabel: {
    color: "#4A5568",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  locationRowValue: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  locationRowValueLarge: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00D4E8",
  },
  zoneRow: {
    flexDirection: "row",
    gap: 12,
  },
  zoneBox: {
    flex: 1,
    backgroundColor: "#0D1117",
    borderRadius: 10,
    padding: 12,
  },
  zoneDivider: {
    width: 1,
    backgroundColor: "#21262D",
  },
  zoneLabel: {
    color: "#4A5568",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  zoneValue: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoLabel: {
    color: "#718096",
    fontSize: 14,
  },
  infoValue: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#161B22",
  },
  ctaButton: {
    backgroundColor: "#00D4E8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#0D1117",
    fontSize: 16,
    fontWeight: "700",
  },
});