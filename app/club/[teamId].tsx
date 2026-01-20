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
import { useAppColors } from "../../src/theme/colors";

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
  const { teamId, teamName } =
    useLocalSearchParams<{ teamId: string; teamName?: string }>();

  const colors = useAppColors();

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

      const standingsList = stRes.data?.response?.[0]?.league?.standings?.[0] || [];

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
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: colors.text }}>
          Loading {teamName || "club"}...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.error, { color: colors.text }]}>{error}</Text>
        <Text style={[styles.tip, { color: colors.subtext }]}>
          Check terminal logs for details.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingBottom: 16 }}
    >
      <Text style={[styles.header, { color: colors.text }]}>
        {teamName || "Club"}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Team Stats (La Liga)
        </Text>

        {standing ? (
          <View style={styles.statsGrid}>
            <Stat label="Rank" value={standing.rank} colors={colors} />
            <Stat label="Points" value={standing.points} colors={colors} />
            <Stat label="Played" value={standing.played} colors={colors} />
            <Stat label="W" value={standing.win} colors={colors} />
            <Stat label="D" value={standing.draw} colors={colors} />
            <Stat label="L" value={standing.lose} colors={colors} />
            <Stat label="GF" value={standing.goalsFor} colors={colors} />
            <Stat label="GA" value={standing.goalsAgainst} colors={colors} />
          </View>
        ) : (
          <Text style={[styles.tip, { color: colors.subtext }]}>
            No standings data found for this team.
          </Text>
        )}
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>Players</Text>

        {players.length === 0 ? (
          <Text style={[styles.tip, { color: colors.subtext }]}>
            No squad data returned.
          </Text>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.playerRow,
                  { borderColor: colors.softBorder },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/player/[playerId]",
                    params: {
                      playerId: String(item.id),
                      playerName: item.name,
                      listPhoto: item.photo,
                    },
                  })
                }
              >
                <Image source={{ uri: item.photo }} style={styles.playerImg} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.playerName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.playerPos, { color: colors.subtext }]}>
                    {item.pos}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

function Stat({
  label,
  value,
  colors,
}: {
  label: string;
  value: number;
  colors: ReturnType<typeof useAppColors>;
}) {
  return (
    <View style={[styles.statBox, { borderColor: colors.softBorder }]}>
      <Text style={[styles.statLabel, { color: colors.subtext }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },

  header: { fontSize: 22, fontWeight: "800", marginBottom: 12 },

  card: {
    borderWidth: 1,
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
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  statLabel: { fontSize: 12 },
  statValue: { fontSize: 16, fontWeight: "800", marginTop: 2 },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  playerImg: { width: 40, height: 40, borderRadius: 20 },
  playerName: { fontSize: 16, fontWeight: "700" },
  playerPos: {},

  error: { fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  tip: { textAlign: "center" },
});
