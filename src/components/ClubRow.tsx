import React from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import { useAppColors } from "../theme/colors";

type Props = {
  name: string;
  logo: string;
  onPress: () => void;
};

export default function ClubRow({ name, logo, onPress }: Props) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.card,
          borderColor: colors.softBorder,
        },
        pressed && styles.pressed,
      ]}
    >
      <Image source={{ uri: logo }} style={styles.logo} />
      <Text
        style={[styles.name, { color: colors.text }]}
        numberOfLines={1}
      >
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  pressed: { opacity: 0.7 },
  logo: { width: 36, height: 36, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600", flex: 1 },
});
