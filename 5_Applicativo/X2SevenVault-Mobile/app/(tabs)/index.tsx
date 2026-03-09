import { CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router"
import { useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"
import Button from "../../components/Button"

export default function ScannerScreen() {

  const [permission, requestPermission] = useCameraPermissions()

  useEffect(() => {
    requestPermission()
  }, [])

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>No camera permission</Text>
      </View>
    )
  }

  function fakeScan() {
    router.push({
      pathname: "../object-details",
      // params: { code: "WH-BOX-3921" }
    })
  }

  return (
    <View style={styles.container}>

      <CameraView style={styles.camera} />

      <View style={styles.controls}>
        <Button title="Simulate Scan" onPress={fakeScan} />
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