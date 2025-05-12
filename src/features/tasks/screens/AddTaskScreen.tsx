// src/features/tasks/screens/AddTaskScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@shared/theme/useTheme';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import ListView from '@shared/components/ListView/ListView';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { createTask, updateTask } from '@features/tasks/api/taskApi';
import { AppStackParamList } from '@features/tasks/types/navigation';
import { TaskType, Task } from '@features/tasks/types/tasks';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTask'>;

// ListItem component for row entries
function ListItem({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome6>['name'];
  label: string;
  detail?: string;
  onPress: () => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.listItem, { paddingVertical: spacing.sm }]}>
      <TouchableOpacity onPress={onPress}>
        <FontAwesome6 name={icon as any} iconStyle="solid" size={spacing.lg} color={colors.text} />
      </TouchableOpacity>
      <TextElement style={[styles.listText, { marginLeft: spacing.md, color: colors.text }]}>
        {label}
      </TextElement>
      {detail && (
        <TextElement style={[styles.listDetail, { marginRight: spacing.md, color: colors.muted }]}>
          {detail}
        </TextElement>
      )}
      <TouchableOpacity onPress={onPress}>
        <FontAwesome6
          name="chevron-right"
          iconStyle="solid"
          size={spacing.lg}
          color={colors.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function AddTaskScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const existingTask = route.params?.task;

  // State defaults or existing values
  const [type, setType] = useState<TaskType>(existingTask?.type ?? 'reminder');
  const [description, setDescription] = useState(existingTask?.text ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [remindAt, setRemindAt] = useState<Date>(
    existingTask?.remindAt ? new Date(existingTask.remindAt) : new Date(),
  );
  const [options, setOptions] = useState<string[]>(existingTask?.options ?? []);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle date picker update
  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setRemindAt(date);
  };

  // Submit handler: create or update
  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Validation', 'Please enter a task description');
      return;
    }
    setLoading(true);
    try {
      const payload: Partial<Task> = {
        text: description.trim(),
        type,
        remindAt: type === 'reminder' ? remindAt.toISOString() : remindAt.toISOString(),
        options: type === 'decision' ? options : undefined,
        deliverAt: type === 'motivation' ? remindAt.toISOString() : remindAt.toISOString(),
      };

      if (existingTask) {
        await updateTask(existingTask.id, payload);
      } else {
        await createTask(payload as any);
      }
      navigation.goBack();
    } catch (error) {
      console.error('[SUBMIT_TASK_ERROR]', error);
      Alert.alert('Error', existingTask ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ListView scrollViewProps={{ contentContainerStyle: styles.content }}>
        <TextElement color="text" weight="600" style={styles.label}>
          Task Type
        </TextElement>
        <View style={styles.grid}>
          {(
            [
              { key: 'reminder', label: 'Reminder', icon: 'clock' },
              { key: 'decision', label: 'Decision', icon: 'circle-question' },
              { key: 'motivation', label: 'Motivation', icon: 'bolt' },
              { key: 'advice', label: 'Advice', icon: 'comment-dots' },
            ] as Array<{ key: TaskType; label: string; icon: string }>
          ).map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              disabled={existingTask && existingTask.type !== key}
              style={[
                styles.card,
                {
                  borderColor: theme.colors.border,
                  padding: theme.spacing.sm,
                  marginBottom: theme.spacing.md,
                },
                type === key && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setType(key)}
            >
              <FontAwesome6
                name={icon as any}
                iconStyle="solid"
                size={theme.spacing.lg}
                color={type === key ? theme.colors.onPrimary : theme.colors.text}
              />
              <TextElement
                style={[
                  styles.cardText,
                  { marginLeft: theme.spacing.md },
                  type === key && { color: theme.colors.onPrimary },
                ]}
              >
                {label}
              </TextElement>
            </TouchableOpacity>
          ))}
        </View>

        <TextElement color="text" weight="600" style={styles.label}>
          Task Description
        </TextElement>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What do you need help with?"
          placeholderTextColor={theme.colors.muted}
          style={[styles.textArea, { borderColor: theme.colors.border, color: theme.colors.text }]}
          multiline
        />

        {type === 'decision' && (
          <>
            <TextElement variant="subtitle" style={{ marginBottom: theme.spacing.sm }}>
              Options
            </TextElement>
            {options.map((opt, idx) => (
              <View key={idx} style={styles.optionRow}>
                <TextInput
                  style={[styles.optionInput, { borderColor: theme.colors.border }]}
                  value={opt}
                  onChangeText={text => {
                    const arr = [...options];
                    arr[idx] = text;
                    setOptions(arr);
                  }}
                  placeholder={`Option ${idx + 1}`}
                />
                <TouchableOpacity
                  onPress={() => setOptions(options.filter((_, i) => i !== idx))}
                  style={{ marginLeft: theme.spacing.sm }}
                >
                  <FontAwesome6
                    name="trash"
                    iconStyle="solid"
                    size={theme.spacing.lg}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.optionRow}>
              <TextInput
                style={[styles.optionInput, { borderColor: theme.colors.border }]}
                placeholder="New option"
                value={newOption}
                onChangeText={setNewOption}
              />
              <TouchableOpacity
                onPress={() => {
                  if (newOption.trim()) {
                    setOptions([...options, newOption.trim()]);
                    setNewOption('');
                  }
                }}
                style={{ marginLeft: theme.spacing.sm }}
              >
                <FontAwesome6
                  name="plus"
                  iconStyle="solid"
                  size={theme.spacing.lg}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        <ListItem
          icon="clock"
          label={type === 'reminder' ? `Set Time (${remindAt.toLocaleString()})` : 'Set Time'}
          onPress={() => setShowDatePicker(true)}
        />

        <ListItem icon="user" label="Who can help?" onPress={() => {}} />
        <ListItem icon="globe" label="Visibility" detail="Public" onPress={() => {}} />
      </ListView>

      {showDatePicker && (
        <DateTimePicker
          value={remindAt}
          mode="datetime"
          display="default"
          onChange={onDateChange}
        />
      )}

      <AnimatedBottomButton
        visible={true}
        title={existingTask ? 'Save Changes' : 'Post Task'}
        onPress={handleSubmit}
        style={styles.postButton}
        isLoading={loading}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  label: {
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    height: 100,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  listText: {
    flex: 1,
    marginLeft: 12,
  },
  listDetail: {
    marginRight: 12,
  },
  postButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
