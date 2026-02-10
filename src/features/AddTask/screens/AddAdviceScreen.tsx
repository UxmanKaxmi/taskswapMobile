import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddTaskStackParamList } from '../navigation/AddTaskNavigator';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
// import MultilineInput from '@shared/components/Inputs/MultilineInput';
import { showToast } from '@shared/utils/toast';

import { colors, spacing } from '@shared/theme';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import TaskBackground from '../components/TaskBackground';
import { ms, vs } from 'react-native-size-matters';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import { getButtonText, getTaskPlaceholder, getTitle } from '../utils/constants';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import TaskDescriptionInput from '../components/TaskDescriptionInput';
import {
  getTypeVisual,
  typeBackgrounds,
  typeBackgroundsHard,
  typeIcons,
} from '@shared/utils/typeVisuals';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { Height } from '@shared/components/Spacing';
import TagHelperCard from '../components/TagHelperCard';
import { HelperUser } from '@features/Home/types/home';
import SelectHelpersModal from '../components/SelectHelpersModal';
import { CreateTaskPayload } from '../types/addTask.types';
import VisibilitySelector from '../components/VisibilitySelector';
import { useCreateTask } from '../hooks/useCreateTask';
import { resetToHomeRoot } from '@navigation/types/navigationUtils';
import { useFollowers } from '@features/User/hooks/useFollowers';
import AnimatedBottomButton, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButton';
import { isAndroid } from '@shared/utils/constants';

type Props = NativeStackScreenProps<AddTaskStackParamList, 'AddAdvice'>;

export default function AddAdviceScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'friends' | 'public' | 'private'>('public');
  const [helpers, setHelpers] = useState<HelperUser[]>([]);
  const helperIds = helpers.map(h => h.id);
  const canSubmit = text.trim().length > 0;
  const [showSubmit, setShowSubmit] = useState(false);
  const [showHelper, setShowHelper] = useState(visibility !== 'private');

  const helperOpacity = useState(new Animated.Value(showHelper ? 1 : 0))[0];
  const helperTranslateY = useState(new Animated.Value(showHelper ? 0 : -12))[0];
  const [showHelperModal, setShowHelperModal] = useState(false);

  const [success, setSuccess] = useState(false);

  // Content exit animation
  const contentOpacity = useState(new Animated.Value(1))[0];
  const contentScale = useState(new Animated.Value(1))[0];

  const { mutate: createTask, isPending } = useCreateTask();
  const { data: friends = [] } = useFollowers();

  useEffect(() => {
    setShowSubmit(canSubmit && !success);
  }, [canSubmit, success]);
  function onSubmit() {
    if (!canSubmit) return;

    if (!text.trim()) {
      showToast({
        type: 'error',
        title: 'Please enter your question',
      });
      return;
    }

    const payload: CreateTaskPayload = {
      type: TaskTypeEnum.Advice,
      text: text.trim(),
      visibility,
      helpers: visibility === 'private' ? [] : helperIds,
    };

    createTask(payload, {
      onSuccess: () => {
        setSuccess(true); // ✅ button morph

        showToast({
          type: 'success',
          title: 'Advice posted! Let the help roll in.',
        });

        // playExitAnimation(() => {
        resetToHomeRoot(navigation);
        // });
      },
    });
  }

  useEffect(() => {
    if (visibility !== 'private') {
      setShowHelper(true);

      Animated.parallel([
        Animated.timing(helperOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(helperTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(helperOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(helperTranslateY, {
          toValue: -12,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHelper(false);
      });
    }
  }, [visibility]);

  function resetSuccessState() {
    setSuccess(false);
    contentOpacity.setValue(1);
    contentScale.setValue(1);
  }

  function playExitAnimation(onFinish?: () => void) {
    setSuccess(true);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 0.97,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(onFinish);
  }
  return (
    <Layout
      scrollable
      footerHeight={showSubmit ? BOTTOM_BUTTON_HEIGHT : 0}
      footerContent={
        <AnimatedBottomButton
          title={getButtonText(TaskTypeEnum.Advice)}
          visible={showSubmit && !success}
          isLoading={isPending}
          onPress={onSubmit}
          buttonColor={colors.adviceBgHardest}
          style={{
            bottom: isAndroid ? vs(-20) : vs(-10),
          }}
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
        <TaskBackground icon={typeIcons.advice} color={typeBackgroundsHard.advice} />

        {/* <StepIndicator step={2} total={2} /> */}
        <AppHeader title={''} />
        {/* Title */}

        <TextElement variant="title" style={styles.subtitle}>
          {getTitle(TaskTypeEnum.Advice)}
        </TextElement>

        <Height size={vs(15)} />

        {/* Input Card */}
        <Shadow size="high" color={typeBackgrounds.advice}>
          <View style={styles.inputCard}>
            {/* DESCRIPTION (REUSED) */}
            <TaskDescriptionInput
              value={text}
              onChange={setText}
              placeholder={getTaskPlaceholder(TaskTypeEnum.Advice)}
              taskType={TaskTypeEnum.Advice}
            />
          </View>
        </Shadow>

        {/* Visibility */}
        <VisibilitySelector
          taskType={TaskTypeEnum.Advice}
          value={visibility}
          onChange={setVisibility}
        />
        {/* Helpers */}
        {showHelper && (
          <Animated.View
            style={{
              opacity: helperOpacity,
              transform: [{ translateY: helperTranslateY }],
            }}
          >
            <TagHelperCard
              helpers={helpers}
              onPress={() => setShowHelperModal(true)}
              taskType={TaskTypeEnum.Advice}
            />
          </Animated.View>
        )}
        <SelectHelpersModal
          visible={showHelperModal}
          selected={helpers.map(h => h.id)}
          onClose={() => setShowHelperModal(false)}
          friends={friends}
          onConfirm={ids => {
            const selectedHelpers = friends.filter((f: { id: string }) => ids.includes(f.id));
            setHelpers(selectedHelpers);
          }}
        />
      </Animated.View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: vs(20),
    fontSize: vs(20),
    lineHeight: vs(26),
    fontWeight: '700',
  },
  inputCard: {
    // marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
  },
  inputFooter: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cta: {
    // marginTop: spacing.lg,
  },
  container: {
    backgroundColor: typeBackgrounds.advice,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
