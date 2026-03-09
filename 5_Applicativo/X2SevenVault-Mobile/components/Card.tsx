import { StyleSheet, View } from "react-native"

type CardProps = {
    children: React.ReactNode
}

export default function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  }
})