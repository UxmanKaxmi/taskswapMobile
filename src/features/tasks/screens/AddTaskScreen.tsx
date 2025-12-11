import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';

import TaskTypeSelector from '../components/TaskTypeSelector';
import TaskDescriptionInput from '../components/TaskDescriptionInput';
import ListTaskOptionSelector from '../components/ListTaskOptionSelector';
import SelectHelpersModal from '../components/SelectHelpersModal';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';

import { useCreateTask } from '../hooks/useCreateTask';
import { AppStackParamList } from '@navigation/types/navigation';
import { TaskType, Task } from '@features/Tasks/types/tasks';
import { CreateTaskPayload } from '../api/taskApi';

import { showToast } from '@shared/utils/toast';
import { colors, spacing } from '@shared/theme';
import { isIOS } from '@shared/utils/constants';

import VisibilitySelector from '../components/VisibilitySelector'; // NEW SMALL COMPONENT
import { vs } from 'react-native-size-matters';

type Props = NativeStackScreenProps<AppStackParamList, 'AddTask'>;

export default function AddTaskScreen({ route, navigation }: Props) {
  const existingTask = route.params?.task;

  const [type, setType] = useState<TaskType>(existingTask?.type ?? 'motivation');
  const [description, setDescription] = useState(existingTask?.text ?? '');
  const [visibility, setVisibility] = useState('public');

  const [remindAt, setRemindAt] = useState<Date>(
    existingTask?.remindAt ? new Date(existingTask.remindAt) : new Date(),
  );

  const [helperIds, setHelperIds] = useState<string[]>([]);
  const [helperModalVisible, setHelperModalVisible] = useState(false);

  const { mutate: createTask, isPending } = useCreateTask();

  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const getButtonText = () => {
    switch (type) {
      case 'motivation':
        return 'Post Motivation';
      case 'reminder':
        return 'Set Reminder';
      case 'decision':
        return 'Ask for Decision';
      case 'advice':
        return 'Ask for Advice';
      default:
        return 'Create Push';
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      showToast({ type: 'error', title: 'Please enter a description' });
      return;
    }

    const payload: Partial<Task> = {
      text: description.trim(),
      type,
      remindAt: type === 'reminder' ? remindAt.toISOString() : undefined,
      helpers: helperIds,
      visibility,
    };

    createTask(payload as CreateTaskPayload, {
      onSuccess: () => {
        showToast({ type: 'success', title: 'Push posted!' });
        navigation.goBack();
      },
    });
  };

  return (
    <Layout>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={isIOS ? 'padding' : undefined} style={{ flex: 1 }}>
          <Animated.View style={{ flex: 1, opacity, transform: [{ scale }] }}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: 140, paddingHorizontal: spacing.md }}
            >
              {/* HEADER */}
              <View style={styles.header}>
                <TextElement variant="title" weight="700" style={styles.title}>
                  Create Push
                </TextElement>

                <TextElement color="muted" style={styles.subtitle}>
                  Share a motivation, reminder, decision, or advice with PushMeUp.
                </TextElement>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                  <Icon set="ion" name="close" size={26} color={colors.text} />
                </TouchableOpacity>
              </View>
              {/* TYPE SELECTOR (REUSED) */}
              <TaskTypeSelector selected={type} onSelect={setType} />
              {/* DESCRIPTION (REUSED) */}
              <TaskDescriptionInput value={description} onChange={setDescription} type={type} />
              {/* REMINDER TIME */}
              {type === 'reminder' && (
                <ListTaskOptionSelector
                  icon="time"
                  label="Set Time"
                  value={remindAt.toISOString()}
                  showDateTimePicker
                  dateTimeValue={remindAt}
                  onDateTimeChange={setRemindAt}
                  valueType="date"
                />
              )}
              {/* HELPERS */}
              <ListTaskOptionSelector
                icon="people"
                label="Who should push you?"
                value={helperIds.length ? `${helperIds.length} selected` : undefined}
                onPress={() => setHelperModalVisible(true)}
                valueType="text"
              />
              {/* VISIBILITY */}
              <VisibilitySelector selected={visibility} onSelect={setVisibility} />
            </ScrollView>

            {/* FOOTER BUTTON */}
            <View style={styles.footer}>
              <PrimaryButton title={getButtonText()} isLoading={isPending} onPress={handleSubmit} />
            </View>

            <SelectHelpersModal
              visible={helperModalVisible}
              selected={helperIds}
              onClose={() => setHelperModalVisible(false)}
              onConfirm={setHelperIds}
            />
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Layout>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  header: {
    // paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    // marginBottom: spacing.md,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: vs(20),
  },
  title: {
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    // paddingHorizontal: spacing.md,

    // borderTopWidth: 1,
    borderColor: colors.border,
  },
});
