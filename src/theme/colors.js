import { useThemeMode } from "./ThemeContext";

export const palette = {
  light: {
    bg: "#ffffff",
    card: "#ffffff",
    text: "#111111",
    subtext: "rgba(0,0,0,0.65)",
    border: "#e6e6e6",
    softBorder: "#f0f0f0",
  },
  dark: {
    bg: "#0b0b0f",
    card: "#14141c",
    text: "#ffffff",
    subtext: "rgba(255,255,255,0.70)",
    border: "#2a2a35",
    softBorder: "#1f1f2a",
  },
};

export function useAppColors() {
  const { theme } = useThemeMode(); // read our theme override
  return theme === "dark" ? palette.dark : palette.light;
}
