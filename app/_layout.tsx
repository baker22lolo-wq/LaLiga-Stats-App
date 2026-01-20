import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="club/[teamId]" options={{ title: "Club" }} />
      <Stack.Screen name="player/[playerId]" options={{ title: "Player" }} />
    </Stack>
  );
}
