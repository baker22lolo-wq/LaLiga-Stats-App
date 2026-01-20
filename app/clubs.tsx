import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ClubRow from "../src/components/ClubRow";
import { LALIGA } from "../src/constants/laliga";
import { api } from "../src/services/api";
import { useAppColors } from "../src/theme/colors";

type TeamItem = {
  id: number;
  name: string;
  logo: string;
};

export default function ClubsScreen() {
  const router = useRouter();
  const colors = useAppColors();

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
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: colors.text }}>
          Loading La Liga clubs...
        </Text>
        <Text style={{ marginTop: 6, color: colors.subtext }}>
          (Pull to refresh later)
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.error, { color: colors.text }]}>{error}</Text>
        <Text
          style={{ marginTop: 8, color: colors.subtext, textAlign: "center" }}
        >
          Try restarting Expo with: npx expo start -c
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* ⚽ Match Simulation button only */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.push("/match-sim")}
          style={({ pressed }) => [
            styles.simBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
            ⚽ Match Sim
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <ClubRow
            name={item.name}
            logo={item.logo}
            onPress={() =>
              router.push(
                `/club/${item.id}?teamName=${encodeURIComponent(item.name)}`,
              )
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  error: { fontSize: 16, fontWeight: "800", textAlign: "center" },

  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  simBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
