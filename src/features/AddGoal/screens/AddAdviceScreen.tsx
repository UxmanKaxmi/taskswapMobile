import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddGoalStackParamList } from '../navigation/AddGoalNavigator';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
// import MultilineInput from '@shared/components/Inputs/MultilineInput';
import { showToast } from '@shared/utils/toast';

import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import GoalBackground from '../components/GoalBackground';
import { ms, vs } from 'react-native-size-matters';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import { getButtonText, getGoalPlaceholder, getTitle } from '../utils/goalCopy';
import { GoalTypeEnum } from '@features/Goals/types/goals';
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
import { useFollowers } from '@features/User/hooks/useFollowers';
import { useFollowing } from '@features/User/hooks/useFollowing';
import AnimatedBottomButton, {
  BOTTOM_BUTTON_HEIGHT,
} from '@shared/components/Buttons/AnimatedBottomButton';
import { isAndroid } from '@shared/utils/constants';
import { useAuth } from '@features/Auth/AuthProvider';

type Props = NativeStackScreenProps<AddGoalStackParamList, 'AddAdvice'>;

export default function AddAdviceScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { typeBackgrounds, typeBackgroundsHard } = useTypeVisuals();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [helpers, setHelpers] = useState<HelperUser[]>([]);
  const helperIds = helpers.map(h => h.id);
  const canSubmit = text.trim().length > 0;
  const [showSubmit, setShowSubmit] = useState(false);
  const helperOpacity = useState(new Animated.Value(1))[0];
  const helperTranslateY = useState(new Animated.Value(0))[0];
  const [showHelperModal, setShowHelperModal] = useState(false);

  const [success, setSuccess] = useState(false);

  // Content exit animation
  const contentOpacity = useState(new Animated.Value(1))[0];
  const contentScale = useState(new Animated.Value(1))[0];

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
    if (!draft || draft.type !== GoalTypeEnum.Advice) return;

    setText(draft.text ?? '');
  }, [route.params?.draft]);

  const hasAutoSubmittedRef = React.useRef(false);
  useEffect(() => {
    const draft = route.params?.draft;
    if (!user) return;
    if (!route.params?.submitAfterAuth) return;
    if (!draft || draft.type !== GoalTypeEnum.Advice) return;
    if (hasAutoSubmittedRef.current) return;

    hasAutoSubmittedRef.current = true;
    createGoal(draft, {
      onSuccess: () => {
        setSuccess(true);
        showToast({
          type: 'success',
          title: 'Advice posted! Let the help roll in.',
        });
        resetToHomeRoot(navigation);
      },
    });
  }, [createGoal, navigation, route.params?.draft, route.params?.submitAfterAuth, user]);

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

    const payload: CreateGoalPayload = {
      type: GoalTypeEnum.Advice,
      text: text.trim(),
      helpers: helperIds,
    };

    if (!user) {
      const rootNav: any = (navigation as any).getParent?.()?.getParent?.();
      (rootNav ?? navigation).navigate('AuthIntro', {
        redirectTo: 'AddGoal',
        params: {
          screen: 'AddAdvice',
          params: { draft: payload, submitAfterAuth: true },
        },
        authContext: 'AddGoal',
      });
      return;
    }

    createGoal(payload, {
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
          title={getButtonText(GoalTypeEnum.Advice)}
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
        <GoalBackground icon={typeIcons.advice} color={typeBackgroundsHard.advice} />

        {/* <StepIndicator step={2} total={2} /> */}
        <AppHeader title={''} />
        {/* Title */}

        <TextElement variant="title" style={styles.subtitle}>
          {getTitle(GoalTypeEnum.Advice)}
        </TextElement>

        <Height size={vs(15)} />

        {/* Input Card */}
        <Shadow size="high" color={typeBackgrounds.advice}>
          <View style={styles.inputCard}>
            {/* DESCRIPTION (REUSED) */}
            <GoalDescriptionInput
              value={text}
              onChange={setText}
              placeholder={getGoalPlaceholder(GoalTypeEnum.Advice)}
              taskType={GoalTypeEnum.Advice}
            />
          </View>
        </Shadow>

        {/* Helpers */}
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
              taskType={GoalTypeEnum.Advice}
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
      // typeBackgrounds.advice (theme-derived)
      backgroundColor: colors.adviceBg,
    },
    content: {
      padding: 16,
      paddingBottom: 40,
    },
  });
