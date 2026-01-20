import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LALIGA } from "../../src/constants/laliga";
import { PLAYER_DETAIL_IMAGES } from "../../src/constants/playerDetailImages";
import { api } from "../../src/services/api";

type PlayerStats = {
  name: string;
  age?: number;
  nationality?: string;
  height?: string;
  weight?: string;
  photo?: string;

  teamName?: string;

  appearances?: number;
  minutes?: number;
  goals?: number;
  assists?: number;
  yellow?: number;
  red?: number;
  rating?: string;
};

export default function PlayerScreen() {
  const router = useRouter();
  const { playerId, playerName, listPhoto } = useLocalSearchParams<{
    playerId: string;
    playerName?: string;
    listPhoto?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  console.log("PLAYER ID ON SCREEN:", playerId);


  // ✅ Image #2 (detail image) — map by playerId, fallback to listPhoto
  const detailPhoto = useMemo(() => {
  const mapped = PLAYER_DETAIL_IMAGES[String(playerId)];

  // GIF or remote image
  if (typeof mapped === "string") {
    return { uri: mapped };
  }

  // Local image require(...)
  if (mapped) {
    return mapped;
  }

  // Fallback to list photo
  if (listPhoto) {
    return { uri: listPhoto };
  }

  return undefined;
}, [playerId, listPhoto]);

  const loadPlayer = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await api.get("/players", {
        params: {
          id: playerId,
          league: LALIGA.leagueId,
          season: LALIGA.season,
        },
      });

      const item = res.data?.response?.[0];
      const player = item?.player;
      const leagueStats = item?.statistics?.[0]; // usually first item matches league/team context

      setStats({
        name: player?.name || playerName || "Player",
        age: player?.age,
        nationality: player?.nationality,
        height: player?.height,
        weight: player?.weight,
        photo: player?.photo,

        teamName: leagueStats?.team?.name,

        appearances: leagueStats?.games?.appearences ?? leagueStats?.games?.appearances,
        minutes: leagueStats?.games?.minutes,
        goals: leagueStats?.goals?.total,
        assists: leagueStats?.goals?.assists,
        yellow: leagueStats?.cards?.yellow,
        red: leagueStats?.cards?.red,
        rating: leagueStats?.games?.rating,
      });
    } catch (e: any) {
      console.log("PLAYER ERROR:", e?.response?.data || e?.message || e);
      setError("Failed to load player stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading player...</Text>
      </View>
    );
  }

  if (error || !stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "No data found."}</Text>
        <Pressable onPress={() => loadPlayer()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 18 }}>
      {/* Header image (Image #2) */}
      <View style={styles.headerWrap}>
        {detailPhoto ? (
  <Image source={detailPhoto} style={styles.headerImage} />
) : (
  <View
    style={[
      styles.headerImage,
      { alignItems: "center", justifyContent: "center" },
    ]}
  >
    <Text style={{ color: "white", opacity: 0.7 }}>No Image</Text>
  </View>
)}


        {/* Dark overlay */}
        <View style={styles.overlay} />

        {/* Back + title */}
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <Text style={styles.playerName} numberOfLines={1}>
            {stats.name}
          </Text>

          <Text style={styles.subText} numberOfLines={1}>
            {stats.teamName ? `${stats.teamName} • ` : ""}La Liga {LALIGA.season}
          </Text>
        </View>
      </View>

      {/* Small profile row (Image #1) */}
      <View style={styles.profileRow}>
        {!!listPhoto && <Image source={{ uri: listPhoto }} style={styles.avatar} />}
        <View style={{ flex: 1 }}>
          <Text style={styles.profileTitle}>Player Profile</Text>
          <Text style={styles.profileMeta}>
            {stats.nationality || "—"} {stats.age ? `• Age ${stats.age}` : ""}
          </Text>
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Season Stats</Text>

        <View style={styles.grid}>
          <StatBox label="Apps" value={stats.appearances} />
          <StatBox label="Minutes" value={stats.minutes} />
          <StatBox label="Goals" value={stats.goals} />
          <StatBox label="Assists" value={stats.assists} />
          <StatBox label="Yellow" value={stats.yellow} />
          <StatBox label="Red" value={stats.red} />
          <StatBox label="Rating" value={stats.rating} />
          <StatBox label="Height" value={stats.height} />
        </View>
      </View>

      {/* Details card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Details</Text>
        <Row label="Nationality" value={stats.nationality} />
        <Row label="Age" value={stats.age?.toString()} />
        <Row label="Height" value={stats.height} />
        <Row label="Weight" value={stats.weight} />
      </View>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: any }) {
  const v = value === undefined || value === null || value === "" ? "—" : String(value);
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>{v}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },

  headerWrap: { height: 280, position: "relative" },
  headerImage: { width: "100%", height: "100%" },
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  headerContent: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 16,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 10,
  },
  backText: { color: "white", fontWeight: "700" },
  playerName: { color: "white", fontSize: 26, fontWeight: "900" },
  subText: { color: "white", opacity: 0.9, marginTop: 4 },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#eee" },
  profileTitle: { fontSize: 16, fontWeight: "800" },
  profileMeta: { marginTop: 2, opacity: 0.7 },

  card: {
    marginTop: 12,
    marginHorizontal: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "white",
  },
  cardTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statBox: {
    width: "23%",
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  statLabel: { fontSize: 12, opacity: 0.7 },
  statValue: { fontSize: 16, fontWeight: "900", marginTop: 2 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f2f2f2",
  },
  rowLabel: { fontWeight: "800" },
  rowValue: { opacity: 0.8 },

  error: { fontSize: 16, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  retryText: { fontWeight: "800" },
});
