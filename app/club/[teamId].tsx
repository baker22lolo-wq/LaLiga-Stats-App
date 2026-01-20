import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LALIGA } from "../../src/constants/laliga";
import { api } from "../../src/services/api";

type Standing = {
  rank: number;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
};

type PlayerItem = {
  id: number;
  name: string;
  pos: string;
  photo: string;
};

export default function ClubScreen() {
  const router = useRouter();
  const { teamId, teamName } = useLocalSearchParams<{ teamId: string; teamName?: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [standing, setStanding] = useState<Standing | null>(null);
  const [players, setPlayers] = useState<PlayerItem[]>([]);

  const loadClubData = async () => {
    setError("");
    setLoading(true);

    try {
      // 1) Standings
      const stRes = await api.get("/standings", {
        params: { league: LALIGA.leagueId, season: LALIGA.season, team: teamId },
      });

      const standingsList =
        stRes.data?.response?.[0]?.league?.standings?.[0] || [];

      const teamStanding = standingsList.find(
        (s: any) => String(s.team?.id) === String(teamId)
      );

      if (teamStanding) {
        setStanding({
          rank: teamStanding.rank,
          points: teamStanding.points,
          played: teamStanding.all?.played,
          win: teamStanding.all?.win,
          draw: teamStanding.all?.draw,
          lose: teamStanding.all?.lose,
          goalsFor: teamStanding.all?.goals?.for,
          goalsAgainst: teamStanding.all?.goals?.against,
        });
      } else {
        setStanding(null);
      }

      // 2) Squad (players)
      const squadRes = await api.get("/players/squads", {
        params: { team: teamId },
      });

      const squad = squadRes.data?.response?.[0]?.players || [];

      const mappedPlayers: PlayerItem[] = squad.map((p: any) => ({
        id: p.id,
        name: p.name,
        pos: p.position,
        photo: p.photo,
      }));

      setPlayers(mappedPlayers);
    } catch (e: any) {
      console.log("CLUB ERROR:", e?.response?.data || e?.message || e);
      setError("Failed to load club data. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubData();
  }, [teamId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading {teamName || "club"}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.tip}>Check terminal logs for details.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 16 }}>
      <Text style={styles.header}>{teamName || "Club"}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Team Stats (La Liga)</Text>

        {standing ? (
          <View style={styles.statsGrid}>
            <Stat label="Rank" value={standing.rank} />
            <Stat label="Points" value={standing.points} />
            <Stat label="Played" value={standing.played} />
            <Stat label="W" value={standing.win} />
            <Stat label="D" value={standing.draw} />
            <Stat label="L" value={standing.lose} />
            <Stat label="GF" value={standing.goalsFor} />
            <Stat label="GA" value={standing.goalsAgainst} />
          </View>
        ) : (
          <Text style={styles.tip}>No standings data found for this team.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Players</Text>

        {players.length === 0 ? (
          <Text style={styles.tip}>No squad data returned.</Text>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.playerRow, pressed && { opacity: 0.7 }]}
                onPress={() =>
                  router.push({
                    pathname: "/player/[playerId]",
                    params: { playerId: String(item.id), 
                      playerName: item.name,
                    listPhoto: item.photo,
                  },
                  })
                }
              >
                <Image source={{ uri: item.photo }} style={styles.playerImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.playerPos}>{item.pos}</Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },

  header: { fontSize: 22, fontWeight: "800", marginBottom: 12 },

  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "23%",
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  statLabel: { fontSize: 12, opacity: 0.7 },
  statValue: { fontSize: 16, fontWeight: "800", marginTop: 2 },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    gap: 10,
  },
  playerImg: { width: 40, height: 40, borderRadius: 20 },
  playerName: { fontSize: 16, fontWeight: "700" },
  playerPos: { opacity: 0.7 },

  error: { fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  tip: { opacity: 0.7, textAlign: "center" },
});
