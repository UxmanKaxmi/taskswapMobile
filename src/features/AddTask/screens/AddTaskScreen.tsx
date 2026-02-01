import React from "react";
import { View, StyleSheet } from "react-native";
import TextElement from "@shared/components/TextElement/TextElement";

export default function AddTaskScreen() {
  return (
    <View style={styles.container}>
      <TextElement>AddTask Screen</TextElement>
      <TextElement>This is the starting point for the AddTask feature.</TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});