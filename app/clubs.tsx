import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import ClubRow from "../src/components/ClubRow";
import { LALIGA } from "../src/constants/laliga";
import { api } from "../src/services/api";

type TeamItem = {
  id: number;
  name: string;
  logo: string;
};

export default function ClubsScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTeams = async () => {
    setError("");
    try {
      const res = await api.get("/teams", {
        params: { league: LALIGA.leagueId, season: LALIGA.season },
      });

      const list: TeamItem[] = (res.data?.response || [])
        .map((item: any) => ({
          id: item.team?.id,
          name: item.team?.name,
          logo: item.team?.logo,
        }))
        .filter((t: TeamItem) => t.id && t.name && t.logo);

      setTeams(list);
    } catch (e) {
      setError("Failed to load teams.");
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
        <Text style={{ marginTop: 10 }}>Loading La Liga clubs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <ClubRow
            name={item.name}
            logo={item.logo}
            onPress={() =>
              router.push(`/club/${item.id}?teamName=${encodeURIComponent(item.name)}`)
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  error: { fontSize: 16, fontWeight: "800", textAlign: "center" },
});
