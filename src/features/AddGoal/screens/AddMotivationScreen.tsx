import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ms, vs } from 'react-native-size-matters';

import { AddGoalStackParamList } from '../navigation/AddGoalNavigator';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import OnboardingHeader from '@shared/components/OnboardingHeader';
import { colors, platformShadow, spacing } from '@shared/theme';
import GoalDescriptionInput from '../components/GoalDescriptionInput';
import { CreateGoalPayload } from '../types/addGoal.types';
import { useCreateGoal } from '../hooks/useCreateGoal';
import { navigateToGoalDetails, resetToHomeRoot } from '@navigation/types/navigationUtils';
import { Goal, GoalTypeEnum } from '@features/Goals/types/goals';
import { BOTTOM_BUTTON_HEIGHT } from '@shared/components/Buttons/AnimatedBottomButton';
import { isAndroid } from '@shared/utils/constants';
import { useAuth } from '@features/Auth/AuthProvider';
import { useModal } from '@shared/components/ModalProvider';
import { navigationRef } from '@navigation/navigationRef';
import { requestNotificationPermissionPromptForValueMoment } from '@lib/notifications/NotificationPermissionPrompt';
import Tag from '@shared/components/Tag/Tag';
import AnimatedBottomButtonWithHeader from '@shared/components/Buttons/AnimatedBottomButtonWithHeader';
import TagHelperCard from '../components/TagHelperCard';
import SelectHelpersModal from '../components/SelectHelpersModal';
import { HelperUser } from '@features/Home/types/home';
import { useFollowers } from '@features/User/hooks/useFollowers';
import { useFollowing } from '@features/User/hooks/useFollowing';
import { FEELING_OPTIONS, FeelingValue, normalizeFeelingValue } from '@shared/utils/feelings';
import Icon from '@shared/components/Icons/Icon';

type Props = NativeStackScreenProps<AddGoalStackParamList, 'AddMotivation'>;

// Minimum characters required before a goal can be posted.
const MIN_TASK_LENGTH = 50;

export default function AddMotivationScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { openModal } = useModal();
  const rootNavigation = React.useMemo(
    () => (navigation as any).getParent?.()?.getParent?.(),
    [navigation],
  );

  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingValue | undefined>(undefined);
  const [helpers, setHelpers] = useState<HelperUser[]>([]);
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [success, setSuccess] = useState(false);

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
    if (!draft || draft.type !== GoalTypeEnum.Motivation) return;

    setText(draft.text ?? '');
    setSelectedFeeling(normalizeFeelingValue(draft.feeling) ?? undefined);
  }, [route.params?.draft]);

  const hasAutoSubmittedRef = React.useRef(false);
  const canSubmit = text.trim().length > 0;

  const handleClose = React.useCallback(() => {
    const parent = (navigation as any).getParent?.();
    if (parent?.canGoBack?.()) {
      parent.goBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    resetToHomeRoot(rootNavigation ?? navigation);
  }, [navigation, rootNavigation]);

  const handleChangeText = React.useCallback(
    (next: string) => {
      setText(next);
      if (error) setError(undefined);
    },
    [error],
  );

  const handleGoalCreated = React.useCallback(
    (task: Goal) => {
      setSuccess(true);

      resetToHomeRoot(rootNavigation ?? navigation);

      setTimeout(() => {
        openModal('motivationSuccess', {
          type: GoalTypeEnum.Motivation,
          onDone: () => {
            resetToHomeRoot(rootNavigation ?? navigation);
          },
          onViewRequest: () => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('App', {
                screen: 'GoalDetail',
                params: { task },
              });
              return;
            }

            navigateToGoalDetails(rootNavigation ?? navigation, task);
          },
          onInviteHelper: () => {
            if (navigationRef.isReady()) {
              navigationRef.navigate('App', {
                screen: 'GoalDetail',
                params: { task, openShareModal: true },
              });
              return;
            }

            navigateToGoalDetails(rootNavigation ?? navigation, task);
          },
        });
      }, 300);

      setTimeout(() => {
        void requestNotificationPermissionPromptForValueMoment();
      }, 900);
    },
    [navigation, openModal, rootNavigation],
  );

  useEffect(() => {
    const draft = route.params?.draft;
    if (!user) return;
    if (!route.params?.submitAfterAuth) return;
    if (!draft || draft.type !== GoalTypeEnum.Motivation) return;
    if (hasAutoSubmittedRef.current) return;

    hasAutoSubmittedRef.current = true;
    createGoal(draft, {
      onSuccess: task => {
        handleGoalCreated(task);
      },
    });
  }, [createGoal, handleGoalCreated, route.params?.draft, route.params?.submitAfterAuth, user]);

  function onSubmit() {
    if (!canSubmit) return;

    const trimmed = text.trim();
    if (trimmed.length < MIN_TASK_LENGTH) {
      setError(`Write at least ${MIN_TASK_LENGTH} characters so people can support you.`);
      return;
    }

    const payload: CreateGoalPayload = {
      type: GoalTypeEnum.Motivation,
      text: text.trim(),
      feeling: selectedFeeling,
      helpers: helpers.map(helper => helper.id),
    };

    if (!user) {
      const rootNav: any = (navigation as any).getParent?.()?.getParent?.();
      (rootNav ?? navigation).navigate('AuthIntro', {
        redirectTo: 'AddGoal',
        params: {
          screen: 'AddMotivation',
          params: { draft: payload, submitAfterAuth: true },
        },
        authContext: 'AddGoal',
      });
      return;
    }

    createGoal(payload, {
      onSuccess: task => {
        handleGoalCreated(task);
      },
    });
  }

  return (
    <Layout
      footerHeight={canSubmit && !success ? BOTTOM_BUTTON_HEIGHT : 0}
      footerContent={
        <AnimatedBottomButtonWithHeader
          title="Post it"
          visible={canSubmit && !success}
          isLoading={isPending}
          onPress={onSubmit}
          buttonColor={colors.tactileMomentumPrimary}
          containerColor={colors.onboardingPaper}
          textColor={colors.tactileMomentumSecondary}
          // buttonStyle={styles.postButton}
          buttonHeader="Once posted, people here can push you forward."
          style={{ bottom: isAndroid ? vs(-20) : vs(0) }}
        />
      }
      scrollable
      // allowPaddingHorizontal={false}
      allowPaddingVertical={false}
      backgroundColor={colors.onboardingPaper}
      style={styles.container}
    >
      <View style={styles.screen}>
        <Pressable
          onPress={handleClose}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        >
          <Icon set="ion" name="close" size={ms(20)} color={colors.onboardingInk} />
        </Pressable>

        <View style={styles.headerBlock}>
          <View style={styles.titleWrap}>
            <TextElement variant="headline" weight="900" style={styles.titleLine}>
              What are you
            </TextElement>
            <View style={styles.titleSecondLine}>
              <TextElement variant="headline" weight="900" style={styles.titleLine}>
                trying to
              </TextElement>
              <View style={styles.highlightWrap}>
                <View style={styles.highlightBar} />
                <TextElement variant="headline" weight="900" style={styles.highlightText}>
                  get done?
                </TextElement>
              </View>
            </View>
          </View>

          <TextElement variant="body" style={styles.subtitle} color="muted">
            Say it out loud. People here will push you forward. No judgment, just momentum.
          </TextElement>
        </View>

        <View style={styles.inputCard}>
          <GoalDescriptionInput
            value={text}
            onChange={handleChangeText}
            error={error}
            placeholder={'e.g. "I want to work out, but I keep putting it off."'}
            taskType={GoalTypeEnum.Motivation}
            charLimit={120}
            minLength={MIN_TASK_LENGTH}
            footerText="No pressure. Say it as it is."
            footerTextColor="onboardingMuted"
            dividerColor={colors.onboardingLine}
            inputWrapperStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />
        </View>

        <View style={styles.feelingsBlock}>
          <TextElement variant="label" weight="700" style={styles.sectionLabel}>
            HOW DOES IT FEEL RIGHT NOW?
          </TextElement>

          <View style={styles.tagWrap}>
            {FEELING_OPTIONS.map(feeling => {
              const selected = selectedFeeling === feeling.value;

              return (
                <Tag
                  key={feeling.value}
                  label={feeling.label}
                  selectOnly
                  selected={selected}
                  onPress={() => setSelectedFeeling(feeling.value)}
                  fillColor={selected ? colors.onboardingInk : colors.onboardingCard}
                  borderColor={selected ? colors.onboardingInk : colors.onboardingLine}
                  labelColor={selected ? 'onPrimary' : 'onboardingInk'}
                  style={styles.feelTag}
                />
              );
            })}
          </View>
        </View>

        <TagHelperCard
          variant="prompt"
          helpers={helpers}
          onPress={() => setShowHelperModal(true)}
          taskType={GoalTypeEnum.Motivation}
          headerLabel="TAG A FRIEND  —"
          headerSuffix="optional"
          title="Tag someone who keeps you honest"
          subtitle="They'll get a nudge to push you."
        />
        {/* <View style={styles.footerCopy}>
          <TextElement variant="body" style={styles.footerText} color="onboardingMuted">
            Your goal is visible to the community. First pushes usually land within minutes — no one
            posts into silence.
          </TextElement>
        </View> */}

        <SelectHelpersModal
          visible={showHelperModal}
          selected={helpers.map(helper => helper.id)}
          onClose={() => setShowHelperModal(false)}
          friends={friends}
          onConfirm={ids => {
            const selectedHelpers = friends.filter(friend => ids.includes(friend.id));
            setHelpers(selectedHelpers);
          }}
        />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.onboardingPaper,
  },
  screen: {
    paddingTop: isAndroid ? vs(18) : 0,
    // paddingHorizontal: ms(28),
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: ms(35),
    height: ms(35),
    borderRadius: ms(35 / 2),
    backgroundColor: colors.onboardingLine,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(-5),
    marginEnd: ms(5),
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  header: {
    marginBottom: vs(16),
    paddingHorizontal: 0,
  },
  headerBlock: {
    // marginTop: vs(8),
    // marginEnd: vs(16),
  },
  titleWrap: {},
  titleLine: {
    color: colors.onboardingInk,
    fontSize: ms(28),
    lineHeight: ms(28),
    letterSpacing: -0.6,
  },
  titleSecondLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  highlightWrap: {
    position: 'relative',
    marginLeft: ms(4),
    paddingHorizontal: ms(2),
    paddingBottom: vs(2),
  },
  highlightBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: vs(2),
    height: vs(11),
    backgroundColor: colors.onboardingPush,
  },
  highlightText: {
    position: 'relative',
    color: colors.onboardingInk,
    fontSize: ms(28),
    lineHeight: ms(28),
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: vs(10),
    fontSize: ms(14),
    lineHeight: ms(20),
    letterSpacing: -0.1,
  },
  inputCard: {
    backgroundColor: colors.onboardingCard,
    borderRadius: 28,
    padding: spacing.md,
    marginTop: vs(16),
    ...platformShadow({
      color: '#000',
      opacity: 0.06,
      radius: 18,
      offset: { width: 0, height: 8 },
    }),
  },
  inputWrapper: {
    height: vs(70),
    borderColor: colors.onboardingPush,
    // borderWidth: 2,
    minHeight: vs(120),
    backgroundColor: colors.onboardingCard,
  },
  input: {
    // minHeight: vs(90),
    fontSize: ms(17),
    lineHeight: ms(23),
    paddingHorizontal: spacing.sm,
    paddingTop: 0,
    color: colors.onboardingInk,
  },
  feelingsBlock: {
    marginTop: vs(24),
  },
  sectionLabel: {
    color: colors.muted,
    letterSpacing: 1.4,
    fontSize: ms(12),
    fontWeight: '800',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: vs(7),
  },
  feelTag: {
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
