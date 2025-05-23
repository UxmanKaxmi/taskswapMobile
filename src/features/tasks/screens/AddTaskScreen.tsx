// src/features/tasks/screens/AddTaskScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@shared/theme/useTheme';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import ListView from '@shared/components/ListView/ListView';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { AppStackParamList } from 'navigation/navigation';
import { TaskType, Task } from '@features/Tasks/types/tasks';
import { updateTask } from '@features/Tasks/api/taskApi';
import { useAddTask } from '../hooks/useAddTask';
import { showToast } from '@shared/utils/toast';
import Icon from '@shared/components/Icons/Icon';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTask'>;

function ListItem({
  icon,
  label,
  detail,
  onPress,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  detail?: string;
  onPress: () => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View style={[styles.listItem, { paddingVertical: spacing.sm }]}>
      <TouchableOpacity onPress={onPress}>
        <Icon set="fa6" name={icon} iconStyle="solid" size={spacing.lg} color={colors.text} />
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
        <Icon
          set="fa6"
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

  const [type, setType] = useState<TaskType>(existingTask?.type ?? 'reminder');
  const [description, setDescription] = useState(existingTask?.text ?? '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [remindAt, setRemindAt] = useState<Date>(
    existingTask?.remindAt ? new Date(existingTask.remindAt) : new Date(),
  );
  const [options, setOptions] = useState<string[]>(existingTask?.options ?? []);
  const [newOption, setNewOption] = useState('');

  const { mutate: addTask, isPending } = useAddTask();

  const onDateChange = (_: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setRemindAt(date);
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      showToast({ type: 'error', title: 'Description required' });
      return;
    }

    const payload: Partial<Task> = {
      text: description.trim(),
      type,
      remindAt: remindAt.toISOString(),
      options: type === 'decision' ? options : undefined,
      deliverAt: type === 'motivation' ? remindAt.toISOString() : undefined,
    };

    if (existingTask) {
      updateTask(existingTask.id, payload)
        .then(() => {
          showToast({ type: 'success', title: 'Task updated!' });
          navigation.navigate('Home');
        })
        .catch(() => {});
    } else {
      addTask(payload as any, {
        onSuccess: () => {
          showToast({ type: 'success', title: 'Task posted!' });
          navigation.navigate('Home');
        },
        onError: () => {},
      });
    }
  };

  return (
    <Layout>
      <ListView scrollViewProps={{ contentContainerStyle: styles.content }}>
        <TextElement color="text" weight="600" style={styles.label}>
          Task Type
        </TextElement>
        <View style={styles.grid}>
          {(['reminder', 'decision', 'motivation', 'advice'] as TaskType[]).map(key => {
            const iconMap: Record<TaskType, string> = {
              reminder: 'clock',
              decision: 'circle-question',
              motivation: 'bolt',
              advice: 'comment-dots',
            };

            return (
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
                <Icon
                  set="fa6"
                  name={iconMap[key]}
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
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </TextElement>
              </TouchableOpacity>
            );
          })}
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
                  <Icon
                    set="fa6"
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
                <Icon
                  set="fa6"
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

      <PrimaryButton
        title={existingTask ? 'Save Changes' : 'Post Task'}
        onPress={handleSubmit}
        style={styles.postButton}
        isLoading={isPending}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  label: { marginBottom: 8 },
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
  postButton: {},
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
