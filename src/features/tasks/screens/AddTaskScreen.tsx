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
import ListTaskOptionSelector from '../components/ListTaskOptionSelector';
import SelectHelpersModal from '../../AddTask/components/SelectHelpersModal';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';

import { AppStackParamList } from '@navigation/types/navigation';
import { TaskType, Task } from '@features/Tasks/types/tasks';

import { showToast } from '@shared/utils/toast';
import { colors, spacing } from '@shared/theme';
import { isIOS } from '@shared/utils/constants';

import { vs } from 'react-native-size-matters';
import { useCreateTask } from '@features/AddTask/hooks/useCreateTask';
import { CreateTaskPayload } from '@features/AddTask';
import VisibilitySelectorWithModal from '@features/AddTask/components/VisibilitySelectorWithModal';
import { typeBackgroundsHardest } from '@shared/utils/typeVisuals';

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

  function getTaskPlaceholder(type: TaskType): string {
    switch (type) {
      case 'motivation':
        return 'e.g. "Motivate me to go to the gym daily."';
      case 'reminder':
        return 'What do you need to remember?';
      case 'decision':
        return 'What are you deciding between?';
      case 'advice':
        return 'What do you want advice on?';
      default:
        return 'Write your push...';
    }
  }

  const getTitle = (type: TaskType) => {
    switch (type) {
      case 'motivation':
        return 'What do you need a push for?';
      case 'reminder':
        return 'Reminder Details';
      case 'decision':
        return 'Decision Details';
      case 'advice':
        return 'Advice Request';
      default:
        return 'Your Push';
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'motivation':
        return 'Ask for Motivation';
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
      visibility: visibility,
    };

    createTask(payload as CreateTaskPayload, {
      onSuccess: () => {
        showToast({ type: 'success', title: 'Push posted!' });
        navigation.goBack();
      },
    });
  };

  return (
    <Layout
      footerContent={
        <PrimaryButton title={getButtonText()} isLoading={isPending} onPress={handleSubmit} />
      }
    >
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
                  Tell people what you need help with — motivation, reminders, advice, or decisions.
                </TextElement>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                  <Icon set="ion" name="close" size={26} color={colors.text} />
                </TouchableOpacity>
              </View>
              {/* TYPE SELECTOR (REUSED) */}
              <TaskTypeSelector selected={type} onSelect={setType} />
              {/* DESCRIPTION (REUSED) */}
              {/* <TaskDescriptionInput
                value={description}
                onChange={setDescription}
                placeholder={getTaskPlaceholder(type)}
                title={getTitle(type)}
              /> */}
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
              <VisibilitySelectorWithModal selected={visibility} onSelect={setVisibility} />
            </ScrollView>

            <SelectHelpersModal
              visible={helperModalVisible}
              selected={helperIds}
              onClose={() => setHelperModalVisible(false)}
              onConfirm={setHelperIds}
              confirmButtonColor={typeBackgroundsHardest[type]}
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
