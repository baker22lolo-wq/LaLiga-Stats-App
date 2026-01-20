import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import React from "react";
import { Pressable, Text, useColorScheme } from "react-native";
import { ThemeProviderCustom, useThemeMode } from "../src/theme/ThemeContext";

function RootNavigation() {
  const systemScheme = useColorScheme();
  const { theme, toggleTheme } = useThemeMode();

  const activeTheme = theme ?? systemScheme;
  const isDark = activeTheme === "dark";

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#0b0b0f" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#111111",
          headerShadowVisible: false,

          // ✅ Button on ALL screens
          headerRight: () => (
            <Pressable
              onPress={toggleTheme}
              style={({ pressed }) => ({
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                opacity: pressed ? 0.6 : 1,
              })}
              hitSlop={10}
            >
              <Text style={{ fontSize: 18 }}>{isDark ? "☀️" : "🌙"}</Text>
            </Pressable>
          ),
        }}
      >
        <Stack.Screen name="clubs" options={{ title: "La Liga Clubs" }} />
        <Stack.Screen name="club/[teamId]" options={{ title: "Club" }} />
        <Stack.Screen name="player/[playerId]" options={{ title: "Player" }} />
        <Stack.Screen
          name="match-sim"
          options={{ title: "Match Simulation" }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <RootNavigation />
    </ThemeProviderCustom>
  );
}
