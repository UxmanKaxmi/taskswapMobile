import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddTaskStackParamList } from '../navigation/AddTaskNavigator';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { showToast } from '@shared/utils/toast';

import { colors, spacing } from '@shared/theme';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import TaskBackground from '../components/TaskBackground';
import { vs } from 'react-native-size-matters';
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
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { getButtonText, getTaskPlaceholder, getTitle } from '../utils/constants';
import AnimatedBottomButton, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButton';
import { isAndroid } from '@shared/utils/constants';

type Props = NativeStackScreenProps<AddTaskStackParamList, 'AddMotivation'>;

export default function AddMotivationScreen({ navigation }: Props) {
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
  const contentOpacity = useState(new Animated.Value(1))[0];
  const contentScale = useState(new Animated.Value(1))[0];

  const { mutate: createTask, isPending } = useCreateTask();
  const { data: friends = [] } = useFollowers();

  useEffect(() => {
    setShowSubmit(canSubmit && !success);
  }, [canSubmit, success]);

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

  function onSubmit() {
    if (!canSubmit) return;

    const payload: CreateTaskPayload = {
      type: TaskTypeEnum.Motivation,
      text: text.trim(),
      visibility,
      helpers: visibility === 'private' ? [] : helperIds,
    };

    createTask(payload, {
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Motivation posted! You’re not alone 💪',
        });

        playExitAnimation(() => {
          resetToHomeRoot(navigation);
        });
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

  return (
    <Layout
      footerHeight={showSubmit ? BOTTOM_BUTTON_HEIGHT : 0}
      footerContent={
        <AnimatedBottomButton
          title={getButtonText(TaskTypeEnum.Motivation)}
          visible={showSubmit && !success}
          isLoading={isPending}
          onPress={onSubmit}
          buttonColor={colors.motivationBgHardest}
          style={{ bottom: isAndroid ? vs(-20) : vs(-10) }}
        />
      }
      scrollable
      style={styles.container}
    >
      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ scale: contentScale }],
        }}
      >
        <TaskBackground icon={typeIcons.motivation} color={typeBackgroundsHard.motivation} />

        <AppHeader title={''} />

        <TextElement variant="title" style={styles.subtitle}>
          {getTitle(TaskTypeEnum.Motivation)}
        </TextElement>

        <Height size={vs(15)} />

        <Shadow size="high" color={typeBackgrounds.motivation}>
          <View style={styles.inputCard}>
            <TaskDescriptionInput
              value={text}
              onChange={setText}
              placeholder={getTaskPlaceholder(TaskTypeEnum.Motivation)}
              taskType={TaskTypeEnum.Motivation}
            />
          </View>
        </Shadow>

        <VisibilitySelector
          taskType={TaskTypeEnum.Motivation}
          value={visibility}
          onChange={setVisibility}
        />

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
              taskType={TaskTypeEnum.Motivation}
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
    backgroundColor: typeBackgrounds.motivation,
  },
});
