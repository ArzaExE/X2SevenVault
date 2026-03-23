import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
        </Pressable>
        <View style={styles.headerIcon}>
          <Ionicons name="information-circle-outline" size={20} color="#00D4E8" />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        <View style={styles.logoContainer}>
            <Image
            source={require("../assets/images/adaptive-icon.png")}
            style={styles.logo}
            resizeMode="contain"
            />
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cube-outline" size={18} color="#E2E8F0" />
            <Text style={styles.cardTitle}>X2SevenVault</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.bodyText}>
            X2SevenVault is a smart warehouse scanner that uses AI to identify
            objects and retrieve their storage location in real time.
          </Text>
        </View>

        {/* How to use */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="help-circle-outline" size={18} color="#E2E8F0" />
            <Text style={styles.cardTitle}>How to use</Text>
          </View>
          {[
            { icon: "camera-outline",   text: "Point the camera at an object in the warehouse." },
            { icon: "scan-outline",     text: "Press the shutter button to capture and analyze." },
            { icon: "location-outline", text: "The app will show the item details and shelf location." },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon as any} size={18} color="#00D4E8" />
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="warning-outline" size={18} color="#E2E8F0" />
            <Text style={styles.cardTitle}>Disclaimer</Text>
          </View>
          <Text style={styles.bodyText}>
            AI detection results may not always be accurate. Always verify the
            shelf location physically before picking or storing items.
          </Text>
        </View>

        {/* Credits */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="code-slash-outline" size={18} color="#E2E8F0" />
            <Text style={styles.cardTitle}>Credits</Text>
          </View>
          <Text style={styles.bodyText}>
            Developed by Christian Arzani.{"\n"}
            Powered by YOLO object detection and Firebase Firestore.
          </Text>
        </View>

      </ScrollView>
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
  version: {
    color: "#00D4E8",
    fontSize: 12,
    fontWeight: "500",
    marginTop: -6,
  },
  divider: {
    height: 1,
    backgroundColor: "#21262D",
  },
  bodyText: {
    color: "#A0AEC0",
    fontSize: 13,
    lineHeight: 21,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#00D4E81A",
    borderWidth: 1,
    borderColor: "#00D4E830",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    flex: 1,
    color: "#A0AEC0",
    fontSize: 13,
    lineHeight: 20,
  },
  logoContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  logo: {
    width: 250,
    height: 250,
    borderRadius: 28,
  },
});