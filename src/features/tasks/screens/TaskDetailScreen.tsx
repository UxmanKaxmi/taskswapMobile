// src/features/tasks/screens/TaskDetailScreen.tsx
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '@shared/types/navigation';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { deleteTask } from '../api/taskApi';
import { Layout } from '@shared/components/Layout';
import Row from '@shared/components/Layout/Row';

// Route expects a `task` param of Task type
export default function TaskDetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<AppStackParamList, 'TaskDetail'>) {
  const { task } = route.params;
  const { colors, spacing } = useTheme();

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(task.id);
            navigation.goBack();
          } catch (err) {
            console.error('[DELETE_TASK_ERROR]', err);
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  return (
    <Layout style={{ justifyContent: 'flex-start' }}>
      <TextElement variant="title" weight="600" marginVertical={spacing.lg}>
        Task Details
      </TextElement>

      <View style={styles.field}>
        <TextElement variant="subtitle" weight="500">
          {task.text}
        </TextElement>
      </View>

      <View style={styles.field}>
        <TextElement variant="caption" color="muted">
          Type
        </TextElement>
        <TextElement variant="body">{task.type}</TextElement>
      </View>

      <View style={styles.field}>
        <TextElement variant="caption" color="muted">
          Created At
        </TextElement>
        <TextElement variant="body">{new Date(task.createdAt).toLocaleString()}</TextElement>
      </View>

      {task.remindAt && (
        <View style={styles.field}>
          <TextElement variant="caption" color="muted">
            Remind At
          </TextElement>
          <TextElement variant="body">{new Date(task.remindAt).toLocaleString()}</TextElement>
        </View>
      )}

      {task.options && task.options.length > 0 && (
        <View style={styles.field}>
          <TextElement variant="caption" color="muted">
            Options
          </TextElement>
          {(task.options ?? []).map((opt, idx) => (
            <TextElement key={idx} variant="body" marginVertical={spacing.xs}>
              • {opt}
            </TextElement>
          ))}
        </View>
      )}

      {task.deliverAt && (
        <View style={styles.field}>
          <TextElement variant="caption" color="muted">
            Deliver At
          </TextElement>
          <TextElement variant="body">{new Date(task.deliverAt).toLocaleString()}</TextElement>
        </View>
      )}

      <Row style={{}}>
        <PrimaryButton
          title="Edit"
          onPress={() => navigation.navigate('AddTask', { task })}
          style={{ flex: 1, marginRight: spacing.sm }}
        />
        <OutlineButton title="Delete" onPress={handleDelete} />
      </Row>
    </Layout>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
