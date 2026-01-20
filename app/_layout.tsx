import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#0b0b0f" : "#ffffff",
          },
          headerTintColor: isDark ? "#ffffff" : "#111111",
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="clubs" options={{ title: "La Liga Clubs" }} />
        <Stack.Screen name="club/[teamId]" options={{ title: "Club" }} />
        <Stack.Screen name="player/[playerId]" options={{ title: "Player" }} />
      </Stack>
    </ThemeProvider>
  );
}
