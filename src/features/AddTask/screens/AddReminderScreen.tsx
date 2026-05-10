import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddTaskStackParamList } from '../navigation/AddTaskNavigator';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import { showToast } from '@shared/utils/toast';

import { colors, spacing } from '@shared/theme';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import TaskBackground from '../components/TaskBackground';
import { vs } from 'react-native-size-matters';
import TaskDescriptionInput from '../components/TaskDescriptionInput';

import { typeBackgrounds, typeBackgroundsHard, typeIcons } from '@shared/utils/typeVisuals';

import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { Height } from '@shared/components/Spacing';

import TagHelperCard from '../components/TagHelperCard';
import SelectHelpersModal from '../components/SelectHelpersModal';
import VisibilitySelector from '../components/VisibilitySelector';

import AnimatedBottomButton, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButton';

import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import { CreateTaskPayload } from '../types/addTask.types';
import { useCreateTask } from '../hooks/useCreateTask';
import { resetToHomeRoot } from '@navigation/types/navigationUtils';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { HelperUser } from '@features/Home/types/home';
import { isAndroid } from '@shared/utils/constants';
import { getButtonText, getTaskPlaceholder, getTitle } from '../utils/taskCopy';
import ReminderWhenPicker from '../components/ReminderWhenPicker';
import { useAuth } from '@features/Auth/AuthProvider';

type Props = NativeStackScreenProps<AddTaskStackParamList, 'AddReminder'>;

export default function AddReminderScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const MIN_REMINDER_OFFSET_MS = 2 * 60 * 60 * 1000; // 2 hours
  const normalizeToMinute = (date: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      0,
      0,
    );
  const getMinReminderDate = () => normalizeToMinute(new Date(Date.now() + MIN_REMINDER_OFFSET_MS));

  const [text, setText] = useState('');
  const [remindAt, setRemindAt] = useState<Date | null>(null);
  const [visibility, setVisibility] = useState<'friends' | 'public' | 'private'>('public');
  const [helpers, setHelpers] = useState<HelperUser[]>([]);
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const minReminderDateRef = React.useRef<Date>(getMinReminderDate());
  const minReminderDate = minReminderDateRef.current;

  const [selectedDate, setSelectedDate] = useState(minReminderDate);
  const [selectedTime, setSelectedTime] = useState(minReminderDate);

  const helperIds = helpers.map(h => h.id);

  const isReminderTimeValid =
    !!remindAt && normalizeToMinute(remindAt).getTime() >= minReminderDate.getTime();

  const canSubmit = text.trim().length > 0 && isReminderTimeValid && !success;

  const { mutate: createTask, isPending } = useCreateTask();
  const { data: friends = [] } = useFollowers(!!user);

  // Content animation
  const contentOpacity = useState(new Animated.Value(1))[0];
  const contentScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    const combined = new Date(selectedDate);
    combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    setRemindAt(combined);
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    const draft = route.params?.draft;
    if (!draft || draft.type !== TaskTypeEnum.Reminder) return;

    setText(draft.text ?? '');
    setVisibility(draft.visibility ?? 'public');

    if (draft.remindAt) {
      const parsed = new Date(draft.remindAt);
      if (!Number.isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setSelectedTime(parsed);
      }
    }
  }, [route.params?.draft]);

  const hasAutoSubmittedRef = React.useRef(false);
  useEffect(() => {
    const draft = route.params?.draft;
    if (!user) return;
    if (!route.params?.submitAfterAuth) return;
    if (!draft || draft.type !== TaskTypeEnum.Reminder) return;
    if (hasAutoSubmittedRef.current) return;

    hasAutoSubmittedRef.current = true;
    createTask(draft, {
      onSuccess: () => {
        setSuccess(true);
        showToast({
          type: 'success',
          title: 'Reminder set successfully',
        });
        resetToHomeRoot(navigation);
      },
    });
  }, [createTask, navigation, route.params?.draft, route.params?.submitAfterAuth, user]);

  function onSubmit() {
    if (!canSubmit || !remindAt) {
      showToast({
        type: 'error',
        title: 'Please complete all fields',
      });
      return;
    }

    const now = Date.now();
    const minAllowedTime = now + 2 * 60 * 60 * 1000;

    if (remindAt.getTime() < minAllowedTime) {
      showToast({
        type: 'error',
        title: 'Reminder must be at least 2 hours from now',
      });
      return;
    }

    const effectiveVisibility = user ? visibility : 'private';
    const effectiveHelpers = user && effectiveVisibility !== 'private' ? helperIds : [];

    const payload: CreateTaskPayload = {
      type: TaskTypeEnum.Reminder,
      text: text.trim(),
      visibility: effectiveVisibility,
      helpers: effectiveHelpers,
      remindAt: remindAt.toISOString(),
    };

    if (!user) {
      const rootNav: any = (navigation as any).getParent?.()?.getParent?.();
      (rootNav ?? navigation).navigate('AuthIntro', {
        redirectTo: 'AddTask',
        params: {
          screen: 'AddReminder',
          params: { draft: payload, submitAfterAuth: true },
        },
        authContext: 'AddTask',
      });
      return;
    }

    createTask(payload, {
      onSuccess: () => {
        setSuccess(true);
        showToast({
          type: 'success',
          title: 'Reminder set successfully',
        });
        resetToHomeRoot(navigation);
      },
    });
  }

  return (
    <Layout
      scrollable
      footerHeight={canSubmit ? BOTTOM_BUTTON_HEIGHT : 0}
      footerContent={
        <AnimatedBottomButton
          title={getButtonText(TaskTypeEnum.Reminder)}
          visible={canSubmit}
          isLoading={isPending}
          onPress={onSubmit}
          buttonColor={colors.reminderBgHardest}
          // style={{ bottom: isAndroid ? vs(-20) : vs(20) }}
        />
      }
      style={styles.container}
    >
      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ scale: contentScale }],
        }}
      >
        <TaskBackground icon={typeIcons.reminder} color={typeBackgroundsHard.reminder} />

        <AppHeader title="" />

        <TextElement variant="title" style={styles.subtitle}>
          {getTitle(TaskTypeEnum.Reminder)}
        </TextElement>

        <Height size={vs(15)} />

        {/* Description */}
        <Shadow size="high" color={typeBackgrounds.reminder}>
          <View style={styles.inputCard}>
            <TaskDescriptionInput
              value={text}
              onChange={setText}
              placeholder={getTaskPlaceholder(TaskTypeEnum.Reminder)}
              taskType={TaskTypeEnum.Reminder}
            />
          </View>
        </Shadow>

        <Height size={vs(14)} />

        {/* Reminder Time */}
        <ReminderWhenPicker
          date={selectedDate}
          time={selectedTime}
          onDateChange={setSelectedDate}
          onTimeChange={setSelectedTime}
          minDate={minReminderDate} // 👈 ADD THIS
        />

        {/* <Height size={vs(14)} /> */}

        {/* Visibility */}
        {user ? (
          <VisibilitySelector
            taskType={TaskTypeEnum.Reminder}
            value={visibility}
            onChange={setVisibility}
          />
        ) : null}

        {/* Helpers  */}
        {user ? (
          <>
            <TagHelperCard
              helpers={helpers}
              onPress={() => setShowHelperModal(true)}
              taskType={TaskTypeEnum.Reminder}
            />

            <SelectHelpersModal
              visible={showHelperModal}
              selected={helperIds}
              friends={friends}
              onClose={() => setShowHelperModal(false)}
              onConfirm={ids => {
                const selected = friends.filter(f => ids.includes(f.id));
                setHelpers(selected);
              }}
              confirmButtonColor={colors.reminderBgHardest}
            />
          </>
        ) : null}
      </Animated.View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: vs(20),
    fontSize: vs(20),
    lineHeight: vs(26),
    fontWeight: '700',
  },
  inputCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
  },
  container: {
    backgroundColor: typeBackgrounds.reminder,
  },
});
