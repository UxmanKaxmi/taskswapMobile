import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddGoalStackParamList } from '../navigation/AddGoalNavigator';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { showToast } from '@shared/utils/toast';

import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import GoalBackground from '../components/GoalBackground';
import { vs } from 'react-native-size-matters';
import GoalDescriptionInput from '../components/GoalDescriptionInput';
import { typeIcons, useTypeVisuals } from '@shared/utils/typeVisuals';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { Height } from '@shared/components/Spacing';
import TagHelperCard from '../components/TagHelperCard';
import { HelperUser } from '@features/Home/types/home';
import SelectHelpersModal from '../components/SelectHelpersModal';
import { CreateGoalPayload } from '../types/addGoal.types';
import { useCreateGoal } from '../hooks/useCreateGoal';
import { resetToHomeRoot } from '@navigation/types/navigationUtils';
import { GoalTypeEnum } from '@features/Goals/types/goals';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { useFollowing } from '@features/User/hooks/useFollowing';
import { getButtonText, getGoalPlaceholder, getTitle } from '../utils/goalCopy';
import DecisionChoicesInput from '../components/DecisionChoicesInput';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton.tsx';
import { isAndroid } from '@shared/utils/constants.ts';
import { useAuth } from '@features/Auth/AuthProvider';

type Props = NativeStackScreenProps<AddGoalStackParamList, 'AddDecision'>;

export default function AddDecisionScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { typeBackgrounds, typeBackgroundsHard } = useTypeVisuals();
  const { user } = useAuth();
  const [text, setText] = useState('');

  const [helpers, setHelpers] = useState<HelperUser[]>([]);
  const helperIds = helpers.map(h => h.id);
  const canSubmit = text.trim().length > 0;

  const helperOpacity = useState(new Animated.Value(1))[0];
  const helperTranslateY = useState(new Animated.Value(0))[0];
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  const [success, setSuccess] = useState(false);
  const contentOpacity = useState(new Animated.Value(1))[0];
  const contentScale = useState(new Animated.Value(1))[0];
  const [options, setOptions] = useState<string[]>(['', '']);

  const canSubmitDecision =
    text.trim().length > 0 && options.length === 2 && options.every(o => o.trim().length > 0);

  const { mutate: createGoal, isPending } = useCreateGoal();
  const { data: followers = [] } = useFollowers(!!user);
  const { data: following = [] } = useFollowing();
  const friends = useMemo(() => {
    const map = new Map<string, HelperUser>();
    [...followers, ...following].forEach(friend => {
      map.set(friend.id, friend);
    });
    return Array.from(map.values());
  }, [followers, following]);

  useEffect(() => {
    const draft = route.params?.draft;
    if (!draft || draft.type !== GoalTypeEnum.Decision) return;

    setText(draft.text ?? '');
    setOptions(draft.options?.length ? [...draft.options] : ['', '']);
  }, [route.params?.draft]);

  const hasAutoSubmittedRef = React.useRef(false);
  useEffect(() => {
    const draft = route.params?.draft;
    if (!user) return;
    if (!route.params?.submitAfterAuth) return;
    if (!draft || draft.type !== GoalTypeEnum.Decision) return;
    if (hasAutoSubmittedRef.current) return;

    hasAutoSubmittedRef.current = true;
    createGoal(draft, {
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
  }, [createGoal, navigation, route.params?.draft, route.params?.submitAfterAuth, user]);

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

    const payload: CreateGoalPayload = {
      type: GoalTypeEnum.Decision,
      text: text.trim(),
      helpers: helperIds,
      options: options.map(o => o.trim()),
    };

    if (!user) {
      const rootNav: any = (navigation as any).getParent?.()?.getParent?.();
      (rootNav ?? navigation).navigate('AuthIntro', {
        redirectTo: 'AddGoal',
        params: {
          screen: 'AddDecision',
          params: { draft: payload, submitAfterAuth: true },
        },
        authContext: 'AddGoal',
      });
      return;
    }

    createGoal(payload, {
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

  return (
    <Layout
      footerContent={
        <AnimatedBottomButton
          title={getButtonText(GoalTypeEnum.Decision)}
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
        <GoalBackground icon={typeIcons.decision} color={typeBackgroundsHard.decision} />

        <AppHeader title="" />

        <TextElement variant="title" style={styles.subtitle}>
          {getTitle(GoalTypeEnum.Decision)}
        </TextElement>

        <Height size={vs(15)} />

        <Shadow size="high" color={typeBackgrounds.decision}>
          <View style={styles.inputCard}>
            <GoalDescriptionInput
              value={text}
              onChange={setText}
              placeholder={getGoalPlaceholder(GoalTypeEnum.Decision)}
              taskType={GoalTypeEnum.Decision}
            />
          </View>
        </Shadow>

        <DecisionChoicesInput choices={options} onChange={setOptions} />

        {user ? (
          <Animated.View
            style={{
              opacity: helperOpacity,
              transform: [{ translateY: helperTranslateY }],
            }}
          >
            <TagHelperCard
              helpers={helpers}
              onPress={() => setShowHelperModal(true)}
              taskType={GoalTypeEnum.Decision}
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
          />
        ) : null}
      </Animated.View>
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      // typeBackgrounds.decision (theme-derived)
      backgroundColor: colors.decisionBg,
    },
  });
