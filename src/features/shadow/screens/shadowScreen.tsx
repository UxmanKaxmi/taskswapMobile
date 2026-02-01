import React from "react";
import { View, StyleSheet } from "react-native";
import TextElement from "@shared/components/TextElement/TextElement";

export default function shadowScreen() {
  return (
    <View style={styles.container}>
      <TextElement>shadow Screen</TextElement>
      <TextElement>This is the starting point for the shadow feature.</TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});