import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createTask, getTasks } from '../api/home';
import { Layout } from '@shared/components/Layout';
import Column from '@shared/components/Layout/Column';
import { useAuth } from '@features/auth/authProvider';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { Task } from '../types/home';
import { theme } from '@shared/theme/theme';

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [type] = useState('reminder'); // hardcoded for now
  const [tasks, setTasks] = useState<Task[]>([]);
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error('[Get Tasks Error]', error);
      Alert.alert('Error', 'Could not fetch tasks');
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Validation', 'Please enter task text');
      return;
    }

    try {
      setLoading(true);
      await createTask({ text, type });
      Alert.alert('Success', 'Task created');
      fetchTasks();
    } catch (err) {
      Alert.alert('Error', 'Could not create task');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <Layout centered>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskText}>{item.text}</Text>
            <Text style={styles.taskType}>{item.type}</Text>
          </View>
        )}
      />

      <TextInput
        placeholder="Enter task text..."
        placeholderTextColor={theme.colors.text}
        value={text}
        onChangeText={setText}
        style={[styles.input, { borderColor: theme.colors.primary }]}
      />

      {/* Optional: Add type selector */}
      {/* <Dropdown or segmented control here for "type" */}

      <PrimaryButton title="Create Task" onPress={handleSubmit} isLoading={loading} />

      <PrimaryButton title="Sign Out" onPress={signOut} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#000',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskType: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
