import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createTask } from '../api/tasks';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import SecondaryButton from '@shared/components/Buttons/SecondaryButton';
import { Layout } from '@shared/components/Layout';
import Row from '@shared/components/Layout/Row';
import Column from '@shared/components/Layout/Column';
import Icon from '@shared/components/Icons/Icon';

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
    <Layout style={{ backgroundColor: '#000' }} centered>
      <Column style={{ backgroundColor: '#eee' }}>
        <Text style={styles.label}>Task</Text>
        <Text style={styles.label}>Task Text</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Enter task text"
        />
        {<Icon name="" iconStyle="solid" size={50} color="blue" />}
      </Column>

      {/* <Column gap={16}>
        <Text>Top</Text>
        <Text>Bottom</Text>
      </Column> */}
      {/* <PrimaryButton
        title="Save Task"
        onPress={handleSubmit}
        disabled
      // icon={<Feather name="check" size={18} color="#fff" />}
      />
      <SecondaryButton
        title="Cancel"
        onPress={() => navigation.goBack()}
        disabled
      // icon={<Feather name="x" size={18} color="#fff" />}
      /> */}

      {/* Uncomment if you want to use a custom button */}
      {/* <Button title="Save Task" onPress={handleSubmit} /> */}
      {/* <Button title="Cancel" onPress={() => navigation.goBack()} /> */}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginTop: 4 },
});
