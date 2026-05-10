import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddTaskStackParamList } from '../navigation/AddTaskNavigator';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';

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
import { navigateToTaskDetails, resetToHomeRoot } from '@navigation/types/navigationUtils';
import { Task, TaskTypeEnum } from '@features/Tasks/types/tasks';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { getButtonText, getSubtitle, getTaskPlaceholder, getTitle } from '../utils/taskCopy';
import AnimatedBottomButton, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButton';
import { isAndroid } from '@shared/utils/constants';
import { useAuth } from '@features/Auth/AuthProvider';
import { api } from '@shared/api/axios';
import { buildRoute } from '@shared/api/apiRoutes';
import { useModal } from '@shared/components/ModalProvider';
import { navigationRef } from '@navigation/navigationRef';

type Props = NativeStackScreenProps<AddTaskStackParamList, 'AddMotivation'>;

export default function AddMotivationScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { openModal } = useModal();
  const rootNavigation = React.useMemo(
    () => (navigation as any).getParent?.()?.getParent?.(),
    [navigation],
  );
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState<'friends' | 'public' | 'private'>('public');
  const [helpers, setHelpers] = useState<HelperUser[]>([]);
  const [createdTask, setCreatedTask] = useState<Task | null>(null);
  const helperIds = helpers.map(h => h.id);
  const canSubmit = text.trim().length > 0;
  const [showSubmit, setShowSubmit] = useState(false);

  const [showHelper, setShowHelper] = useState(visibility !== 'private');
  const helperOpacity = useState(new Animated.Value(showHelper ? 1 : 0))[0];
  const helperTranslateY = useState(new Animated.Value(showHelper ? 0 : -12))[0];
  const [showHelperModal, setShowHelperModal] = useState(false);

  const [success, setSuccess] = useState(false);

  const { mutate: createTask, isPending } = useCreateTask();
  const { data: friends = [] } = useFollowers(!!user);

  useEffect(() => {
    const draft = route.params?.draft;
    if (!draft || draft.type !== TaskTypeEnum.Motivation) return;

    setText(draft.text ?? '');
    setVisibility(draft.visibility ?? 'public');
    // Helpers require user context; keep empty for guest drafts.
  }, [route.params?.draft]);

  const hasAutoSubmittedRef = React.useRef(false);

  const handleTaskCreated = React.useCallback(
    (task: Task) => {
      setCreatedTask(task);
      setSuccess(true);

      resetToHomeRoot(rootNavigation ?? navigation);

      setTimeout(() => {
        openModal('motivationSuccess', {
          type: TaskTypeEnum.Motivation,
          onDone: () => {
            resetToHomeRoot(rootNavigation ?? navigation);
          },
          onViewRequest: () => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('App', {
                screen: 'TaskDetail',
                params: { task },
              });
              return;
            }

            navigateToTaskDetails(rootNavigation ?? navigation, task);
          },
          onInviteHelper: () => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('App', {
                screen: 'TaskDetail',
                params: { task, openShareModal: true },
              });
              return;
            }

            navigateToTaskDetails(rootNavigation ?? navigation, task);
          },
        });
      }, 300);
    },
    [navigation, openModal, rootNavigation],
  );

  useEffect(() => {
    const draft = route.params?.draft;
    if (!user) return;
    if (!route.params?.submitAfterAuth) return;
    if (!draft || draft.type !== TaskTypeEnum.Motivation) return;
    if (hasAutoSubmittedRef.current) return;

    hasAutoSubmittedRef.current = true;
    createTask(draft, {
      onSuccess: task => {
        handleTaskCreated(task);
      },
    });
  }, [createTask, handleTaskCreated, route.params?.draft, route.params?.submitAfterAuth, user]);

  useEffect(() => {
    setShowSubmit(canSubmit && !success);
  }, [canSubmit, success]);

  function onSubmit() {
    if (!canSubmit) return;

    const effectiveVisibility = user ? visibility : 'private';
    const effectiveHelpers = user && effectiveVisibility !== 'private' ? helperIds : [];

    const payload: CreateTaskPayload = {
      type: TaskTypeEnum.Motivation,
      text: text.trim(),
      visibility: effectiveVisibility,
      helpers: effectiveHelpers,
    };

    if (!user) {
      const rootNav: any = (navigation as any).getParent?.()?.getParent?.();
      (rootNav ?? navigation).navigate('AuthIntro', {
        redirectTo: 'AddTask',
        params: {
          screen: 'AddMotivation',
          params: { draft: payload, submitAfterAuth: true },
        },
        authContext: 'AddTask',
      });
      return;
    }

    createTask(payload, {
      onSuccess: task => {
        handleTaskCreated(task);
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

  const handleHelpersConfirmed = React.useCallback(
    async (ids: string[]) => {
      const selectedHelpers = friends.filter((friend: HelperUser) => ids.includes(friend.id));
      setHelpers(selectedHelpers);
      setShowHelperModal(false);

      if (!createdTask) return;

      try {
        const { data: updatedTask } = await api.patch<Task>(buildRoute.task(createdTask.id), {
          helpers: ids,
        });
        setCreatedTask(updatedTask);
      } catch {
        // no-op
      }
    },
    [createdTask, friends],
  );

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
      <View>
        <TaskBackground icon={typeIcons.motivation} color={typeBackgroundsHard.motivation} />

        <AppHeader title={''} />

        <TextElement variant="title" style={styles.subtitle}>
          {getTitle(TaskTypeEnum.Motivation)}
        </TextElement>

        <TextElement variant="caption" style={styles.subtitle2}>
          {getSubtitle(TaskTypeEnum.Motivation)}
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

        {user ? (
          <VisibilitySelector
            taskType={TaskTypeEnum.Motivation}
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
              taskType={TaskTypeEnum.Motivation}
            />
          </Animated.View>
        ) : null}

        {user ? (
          <SelectHelpersModal
            visible={showHelperModal}
            selected={helpers.map(h => h.id)}
            onClose={() => setShowHelperModal(false)}
            friends={friends}
            onConfirm={handleHelpersConfirmed}
            confirmButtonColor={colors.motivationBgHardest}
          />
        ) : null}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: vs(20),
    fontSize: vs(22),
    lineHeight: vs(26),
    fontWeight: '600',
  },
  subtitle2: {
    marginTop: vs(7),
    fontWeight: '300',
    marginEnd: spacing.lg,
    color: colors.text,
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
