import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from "react-native";

import Constants from "expo-constants";
import { LALIGA } from "../../src/constants/laliga";
import { api } from "../../src/services/api";

type TeamItem = {
  id: number;
  name: string;
  logo: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTeams = async () => {
  setError("");

  console.log("API KEY:", Constants.expoConfig?.extra?.API_FOOTBALL_KEY);
  console.log("League/Season:", LALIGA);

  try {
    const res = await api.get("/teams", {
      params: { league: LALIGA.leagueId, season: LALIGA.season },
    });

    console.log("Response:", res.data);

    const list: TeamItem[] = (res.data?.response || [])
      .map((item: any) => ({
        id: item.team?.id,
        name: item.team?.name,
        logo: item.team?.logo,
      }))
      .filter((t: TeamItem) => t.id && t.name && t.logo);

    setTeams(list);
  } catch (e: any) {
    console.log("API ERROR:", e?.response?.data || e?.message || e);
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
        <Text style={styles.tip}>
          Tip: confirm your API key in .env then restart with: npx expo start -c
        </Text>
      </View>
    );
  }
  if (!teams.length) {
  return (
    <View style={styles.center}>
      <Text style={styles.error}>No teams found.</Text>
      <Text style={styles.tip}>
        This usually means the season is not available on your API plan.
      </Text>
    </View>
  );
}

return (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 28, fontWeight: "bold" }}>HOME SCREEN WORKING</Text>
  </View>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  error: { fontSize: 16, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  tip: { opacity: 0.7, textAlign: "center" },
});
