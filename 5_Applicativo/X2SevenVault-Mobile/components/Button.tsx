import { Pressable, StyleSheet, Text } from "react-native"

type ButtonProps = {
  title: string
  onPress: () => void
}

export default function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },
  text: {
    color: "white",
    fontWeight: "600"
  }
})