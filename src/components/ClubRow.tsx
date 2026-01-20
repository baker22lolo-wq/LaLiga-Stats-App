import React from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  name: string;
  logo: string;
  onPress: () => void;
};

export default function ClubRow({ name, logo, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image source={{ uri: logo }} style={styles.logo} />
      <Text style={styles.name} numberOfLines={1}>
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
    borderColor: "#e6e6e6",
    backgroundColor: "white",
  },
  pressed: { opacity: 0.7 },
  logo: { width: 36, height: 36, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600", flex: 1 },
});
