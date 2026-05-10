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
import { typeBackgrounds, typeBackgroundsHard, typeIcons } from '@shared/utils/typeVisuals';
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
import { getButtonText, getTaskPlaceholder, getTitle } from '../utils/taskCopy';
import DecisionChoicesInput from '../components/DecisionChoicesInput.tsx';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton.tsx';
import { isAndroid } from '@shared/utils/constants.ts';
import { useAuth } from '@features/Auth/AuthProvider';

type Props = NativeStackScreenProps<AddTaskStackParamList, 'AddDecision'>;

export default function AddDecisionScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'friends' | 'public' | 'private'>('public');

  const [helpers, setHelpers] = useState<HelperUser[]>([]);
  const helperIds = helpers.map(h => h.id);
  const canSubmit = text.trim().length > 0;

  const [showHelper, setShowHelper] = useState(visibility !== 'private');
  const helperOpacity = useState(new Animated.Value(showHelper ? 1 : 0))[0];
  const helperTranslateY = useState(new Animated.Value(showHelper ? 0 : -12))[0];
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  const [success, setSuccess] = useState(false);
  const contentOpacity = useState(new Animated.Value(1))[0];
  const contentScale = useState(new Animated.Value(1))[0];
  const [options, setOptions] = useState<string[]>(['', '']);

  const canSubmitDecision =
    text.trim().length > 0 && options.length === 2 && options.every(o => o.trim().length > 0);

  const { mutate: createTask, isPending } = useCreateTask();
  const { data: friends = [] } = useFollowers(!!user);

  useEffect(() => {
    const draft = route.params?.draft;
    if (!draft || draft.type !== TaskTypeEnum.Decision) return;

    setText(draft.text ?? '');
    setVisibility(draft.visibility ?? 'public');
    setOptions(draft.options?.length ? [...draft.options] : ['', '']);
  }, [route.params?.draft]);

  const hasAutoSubmittedRef = React.useRef(false);
  useEffect(() => {
    const draft = route.params?.draft;
    if (!user) return;
    if (!route.params?.submitAfterAuth) return;
    if (!draft || draft.type !== TaskTypeEnum.Decision) return;
    if (hasAutoSubmittedRef.current) return;

    hasAutoSubmittedRef.current = true;
    createTask(draft, {
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Decision shared! Let’s decide together 🤝',
        });

        playExitAnimation(() => {
          resetToHomeRoot(navigation);
        });
      },
    });
  }, [createTask, navigation, route.params?.draft, route.params?.submitAfterAuth, user]);

  useEffect(() => {
    setShowSubmit(canSubmitDecision);
  }, [canSubmitDecision]);

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
    if (!canSubmitDecision) return;

    const effectiveVisibility = user ? visibility : 'private';
    const effectiveHelpers = user && effectiveVisibility !== 'private' ? helperIds : [];

    const payload: CreateTaskPayload = {
      type: TaskTypeEnum.Decision,
      text: text.trim(),
      visibility: effectiveVisibility,
      helpers: effectiveHelpers,
      options: options.map(o => o.trim()),
    };

    if (!user) {
      const rootNav: any = (navigation as any).getParent?.()?.getParent?.();
      (rootNav ?? navigation).navigate('AuthIntro', {
        redirectTo: 'AddTask',
        params: {
          screen: 'AddDecision',
          params: { draft: payload, submitAfterAuth: true },
        },
        authContext: 'AddTask',
      });
      return;
    }

    createTask(payload, {
      onSuccess: () => {
        showToast({
          type: 'success',
          title: 'Decision shared! Let’s decide together 🤝',
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
      footerContent={
        <AnimatedBottomButton
          title={getButtonText(TaskTypeEnum.Decision)}
          visible={showSubmit && !success}
          isLoading={isPending}
          onPress={onSubmit}
          buttonColor={colors.decisionBgHardest}
        />
      }
      footerHeight={showSubmit ? (isAndroid ? vs(90) : vs(80)) : vs(5)}
      scrollable
      style={styles.container}
    >
      <Animated.View
        style={{
          opacity: contentOpacity,
          transform: [{ scale: contentScale }],
        }}
      >
        <TaskBackground icon={typeIcons.decision} color={typeBackgroundsHard.decision} />

        <AppHeader title="" />

        <TextElement variant="title" style={styles.subtitle}>
          {getTitle(TaskTypeEnum.Decision)}
        </TextElement>

        <Height size={vs(15)} />

        <Shadow size="high" color={typeBackgrounds.decision}>
          <View style={styles.inputCard}>
            <TaskDescriptionInput
              value={text}
              onChange={setText}
              placeholder={getTaskPlaceholder(TaskTypeEnum.Decision)}
              taskType={TaskTypeEnum.Decision}
            />
          </View>
        </Shadow>

        <DecisionChoicesInput choices={options} onChange={setOptions} />

        {user ? (
          <VisibilitySelector
            taskType={TaskTypeEnum.Decision}
            value={visibility}
            onChange={setVisibility}
          />
        ) : null}

        {user && showHelper ? (
          <Animated.View
            style={{
              opacity: helperOpacity,
              transform: [{ translateY: helperTranslateY }],
            }}
          >
            <TagHelperCard
              helpers={helpers}
              onPress={() => setShowHelperModal(true)}
              taskType={TaskTypeEnum.Decision}
            />
          </Animated.View>
        ) : null}

        {user ? (
          <SelectHelpersModal
            visible={showHelperModal}
            selected={helpers.map(h => h.id)}
            onClose={() => setShowHelperModal(false)}
            friends={friends}
            onConfirm={ids => {
              const selectedHelpers = friends.filter((f: { id: string }) => ids.includes(f.id));
              setHelpers(selectedHelpers);
            }}
            confirmButtonColor={colors.decisionBgHardest}
          />
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
    backgroundColor: typeBackgrounds.decision,
  },
});
