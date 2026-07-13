import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ms, vs } from 'react-native-size-matters';

import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import Tag from '@shared/components/Tag/Tag';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { AppStackParamList } from '@navigation/types/navigation';
import { useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
import { useAuth } from '@features/Auth/AuthProvider';
import { FEELING_OPTIONS, FeelingValue } from '@shared/utils/feelings';
import { showToast } from '@shared/utils/toast';

import CircleAvatarStack from '../components/CircleAvatarStack';
import { getApiErrorMessage, useCircleInvitePreview, useJoinCircle } from '../hooks/useCircles';
import { formatRoster } from '../utils/roster';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinCircle'>;

const STATE_COPY: Record<string, { title: string; subtitle: string }> = {
  expired: {
    title: 'This invite has expired',
    subtitle: 'Invites last 7 days. Ask your friend for a fresh link.',
  },
  full: {
    title: 'This circle is full',
    subtitle: 'Circles hold 5 people. Ask your friend to start another one.',
  },
  closed: {
    title: 'This circle has wrapped up',
    subtitle: 'The moment passed. Start your own and invite them back.',
  },
};

export default function JoinCircleScreen({ navigation, route }: Props) {
  const { token } = route.params;
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();

  const [selectedFeeling, setSelectedFeeling] = useState<FeelingValue | undefined>(undefined);
  const { data: preview, isLoading, isError, refetch } = useCircleInvitePreview(token);
  const joinCircle = useJoinCircle();

  const onPressJoin = useCallback(() => {
    // Guests see the invite; joining is the auth moment. The pending-route
    // machinery reopens this screen (same token) after login.
    if (!user) {
      checkAuthThenNavigate();
      return;
    }

    joinCircle.mutate(
      { token, payload: { feeling: selectedFeeling } },
      {
        onSuccess: joined => {
          (navigation as any).replace('CircleDetail', { circleId: joined.circle.id });
        },
        onError: error => {
          showToast({
            type: 'error',
            title: getApiErrorMessage(error, "Couldn't join this circle"),
          });
          void refetch();
        },
      },
    );
  }, [checkAuthThenNavigate, joinCircle, navigation, refetch, selectedFeeling, token, user]);

  const blockedCopy = preview && preview.state !== 'open' ? STATE_COPY[preview.state] : null;

  return (
    <Layout
      scrollable
      allowPaddingVertical={false}
      backgroundColor={colors.onboardingPaper}
      style={styles.container}
    >
      <View style={styles.backRow}>
        <Pressable
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('Tabs', { screen: 'Home' });
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={styles.backButton}
        >
          <Icon set="ion" name="close" size={ms(20)} color={colors.onboardingInk} />
        </Pressable>
      </View>

      {isLoading ? (
        <TextElement variant="body" color="muted" style={styles.stateText}>
          Opening your invite...
        </TextElement>
      ) : null}

      {isError ? (
        <View style={styles.blockedWrap}>
          <TextElement variant="headline" weight="800" style={styles.blockedTitle}>
            This invite isn't valid
          </TextElement>
          <TextElement variant="body" color="muted" style={styles.blockedSubtitle}>
            The link may be broken. Ask your friend to send it again.
          </TextElement>
        </View>
      ) : null}

      {preview && blockedCopy ? (
        <View style={styles.blockedWrap}>
          <TextElement variant="headline" weight="800" style={styles.blockedTitle}>
            {blockedCopy.title}
          </TextElement>
          <TextElement variant="body" color="muted" style={styles.blockedSubtitle}>
            {blockedCopy.subtitle}
          </TextElement>
        </View>
      ) : null}

      {preview && !blockedCopy ? (
        <>
          <View style={styles.iconCircle}>
            <Icon set="ion" name="people" size={ms(22)} color={colors.tactileMomentumSecondary} />
          </View>

          <TextElement variant="headline" weight="800" style={styles.title}>
            You're invited to a circle
          </TextElement>
          <TextElement variant="body" color="muted" style={styles.subtitle}>
            Same sentence, own momentum. You get your own push page inside the circle.
          </TextElement>

          <View style={styles.sentenceCard}>
            <TextElement variant="subtitle" weight="800" style={styles.sentence}>
              “{preview.goalText}”
            </TextElement>

            <View style={styles.membersRow}>
              <CircleAvatarStack
                members={preview.members.map((member, index) => ({
                  userId: `${member.name}-${index}`,
                  name: member.name,
                  avatar: member.avatar,
                }))}
                size={26}
              />
              <TextElement variant="caption" color="muted" style={styles.membersText}>
                <TextElement variant="caption" weight="700" style={styles.membersNames}>
                  {formatRoster(preview.members.map(member => member.name))}
                </TextElement>{' '}
                {preview.memberCount === 1 ? 'is' : 'are'} already in
              </TextElement>
            </View>
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
                    labelColor={selected ? 'onboardingCard' : 'onboardingInk'}
                    style={styles.feelTag}
                  />
                );
              })}
            </View>
          </View>

          <Pressable
            style={styles.joinCta}
            onPress={onPressJoin}
            disabled={joinCircle.isPending}
            accessibilityRole="button"
            accessibilityLabel="Join this circle"
          >
            <TextElement variant="subtitle" weight="700" style={styles.joinCtaText}>
              {joinCircle.isPending ? 'Joining...' : 'Join the circle'}
            </TextElement>
          </Pressable>

          <TextElement variant="caption" color="muted" style={styles.finePrint}>
            Your goal goes live the moment you join. People can push you forward right away.
          </TextElement>
        </>
      ) : null}
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.onboardingPaper,
      marginHorizontal: spacing.sm,
    },
    backRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingVertical: vs(8),
    },
    backButton: {
      width: ms(35),
      height: ms(35),
      borderRadius: ms(17.5),
      backgroundColor: colors.onboardingLine,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stateText: {
      marginTop: vs(40),
      textAlign: 'center',
    },
    blockedWrap: {
      marginTop: vs(48),
      alignItems: 'center',
      paddingHorizontal: ms(16),
    },
    blockedTitle: {
      fontSize: ms(22),
      color: colors.onboardingInk,
      textAlign: 'center',
      marginBottom: vs(8),
    },
    blockedSubtitle: {
      textAlign: 'center',
      lineHeight: ms(20),
    },
    iconCircle: {
      width: ms(46),
      height: ms(46),
      borderRadius: ms(23),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: vs(6),
      marginBottom: vs(10),
    },
    title: {
      fontSize: ms(24),
      lineHeight: ms(28),
      letterSpacing: -0.5,
      color: colors.onboardingInk,
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      marginTop: vs(6),
      marginBottom: vs(16),
      lineHeight: ms(20),
    },
    sentenceCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: spacing.md,
      marginBottom: vs(20),
    },
    sentence: {
      fontSize: ms(18),
      lineHeight: ms(24),
      letterSpacing: -0.3,
      color: colors.text,
      marginBottom: vs(12),
    },
    membersRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
    },
    membersText: {
      fontSize: ms(12),
      flex: 1,
    },
    membersNames: {
      fontSize: ms(12),
      color: colors.text,
    },
    feelingsBlock: {
      marginBottom: vs(20),
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
    joinCta: {
      backgroundColor: colors.onboardingPush,
      borderRadius: 999,
      paddingVertical: vs(13),
      alignItems: 'center',
    },
    joinCtaText: {
      color: colors.tactileMomentumSecondary,
      fontSize: ms(15),
    },
    finePrint: {
      textAlign: 'center',
      marginTop: vs(10),
      marginBottom: vs(24),
      lineHeight: ms(15),
    },
  });
