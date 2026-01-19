import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Club() {
  const { teamId, teamName } = useLocalSearchParams();

  return (
    <View style={styles.center}>
      <Text style={styles.title}>{teamName || "Club"}</Text>
      <Text>Team ID: {teamId}</Text>
      <Text style={{ marginTop: 10, opacity: 0.7 }}>
        Next: team standings + players list
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
});
