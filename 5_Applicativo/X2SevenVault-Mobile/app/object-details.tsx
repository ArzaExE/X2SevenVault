import { useLocalSearchParams } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import Card from "../components/Card"

type Params = {
  code?: string
}

export default function ObjectDetailsScreen() {

  const { code } = useLocalSearchParams<Params>()

  return (
    <View style={styles.container}>

      <Card>
        <Text style={styles.title}>Object Code</Text>
        <Text style={styles.value}>{code}</Text>
      </Card>

      <Card>
        <Text style={styles.title}>Location</Text>
        <Text style={styles.value}>Aisle 3 - Shelf B</Text>
      </Card>

      <Card>
        <Text style={styles.title}>Status</Text>
        <Text style={styles.value}>In Stock</Text>
      </Card>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6
  },
  value: {
    fontSize: 18
  }
})