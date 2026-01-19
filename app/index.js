import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import ClubRow from "../src/components/ClubRow";
import { LALIGA } from "../src/constants/laliga";
import { api } from "../src/services/api";

export default function Home() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTeams = async () => {
    setError("");
    try {
      const res = await api.get("/teams", {
        params: { league: LALIGA.leagueId, season: LALIGA.season },
      });

      const list = (res.data?.response || []).map((item) => ({
        id: item.team?.id,
        name: item.team?.name,
        logo: item.team?.logo,
      }));

      setTeams(list);
    } catch (e) {
      setError("Failed to load teams. Check API key / season / internet.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadTeams();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading La Liga teams...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.tip}>Tip: confirm your API key in .env and restart Expo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ClubRow
            name={item.name}
            logo={item.logo}
            onPress={() => router.push(`/club/${item.id}?teamName=${encodeURIComponent(item.name)}`)}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  error: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  tip: { opacity: 0.7, textAlign: "center" },
});
