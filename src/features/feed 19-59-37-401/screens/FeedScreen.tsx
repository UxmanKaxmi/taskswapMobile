import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "@/shared/components/Text";

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <AppText size="lg" weight="semi">Feed Screen</AppText>
      <AppText>This is the starting point for the Feed feature.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});