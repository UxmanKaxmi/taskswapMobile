import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createTask } from '../api/tasks';

export default function AddTaskScreen() {
  const [text, setText] = useState('');
  const [type, setType] = useState('reminder'); // hardcoded for now
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!text.trim()) return Alert.alert('Error', 'Task text is required');

    try {
      await createTask({ text, type });
      Alert.alert('Success', 'Task created!');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to create task');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Task Text</Text>
      <TextInput style={styles.input}  value={text} onChangeText={setText} placeholder="e.g., Drink water" />

      <Text style={styles.label}>Task Type</Text>
      <TextInput style={styles.input} value={type} onChangeText={setType} placeholder="e.g., reminder, motivation" />

      <Button title="Create Task" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontWeight: 'bold', marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginTop: 4 },
});