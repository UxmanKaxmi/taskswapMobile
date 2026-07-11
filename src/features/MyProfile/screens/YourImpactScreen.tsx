import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ms, vs } from 'react-native-size-matters';

import { AppNavigationProp } from '@navigation/types/navigation';
import Avatar from '@shared/components/Avatar/Avatar';
import BackButton from '@shared/components/Buttons/BackButton';
import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import Layout from '@shared/components/Layout/Layout';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { isDEV } from '@shared/utils/constants';
import WhatsNewModal from '@features/LaunchModals/modals/WhatsNewModal';
import { useMyImpact } from '../hooks/useMyImpact';
import { ImpactStats } from '../types/impact.types';

// The hero card stays brand-yellow in both themes, so its ink is fixed.
const HERO_INK = '#16171F';
const HERO_INK_SOFT = 'rgba(22, 23, 31, 0.55)';

const AVATAR_PREVIEW_LIMIT = 6;

function finishTiming(days: number) {
  if (days <= 0) return 'the same day';
  if (days === 1) return 'a day later';
  return `${days} days later`;
}

export default function YourImpactScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<AppNavigationProp>();
  const { data: impact, isLoading } = useMyImpact();
  const [whatsNewPreviewVisible, setWhatsNewPreviewVisible] = useState(false);

  return (
    <Layout
      scrollable
      allowPaddingVertical={false}
      allowPaddingHorizontal={false}
      backgroundColor={colors.onboardingPaper}
    >
      <View style={styles.content}>
        <Row align="center" justify="space-between" style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.privatePill}>
            <Icon set="ion" name="lock-closed" size={12} color={colors.onboardingInkSoft} />
            <TextElement style={styles.privatePillText}>Only you can see this</TextElement>
          </View>
        </Row>

        <View style={styles.copyBlock}>
          <TextElement style={styles.title}>Your impact</TextElement>
          <TextElement style={styles.subtitle}>
            A look at the people you have shown up for.
          </TextElement>
        </View>

        {isLoading || !impact ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.onboardingInk} />
          </View>
        ) : (
          <>
            <HeroCard impact={impact} styles={styles} />
            <GivingSection impact={impact} styles={styles} />
            <TopCheerSection impact={impact} styles={styles} />
            <JourneySection impact={impact} styles={styles} colors={colors} />

            <TextElement style={styles.closingText}>
              Every push was a moment someone felt less alone.
              {'\n'}
              <TextElement style={styles.closingTextStrong}>Keep showing up.</TextElement>
            </TextElement>
          </>
        )}

        {isDEV && (
          <Ripple style={styles.devButton} onPress={() => setWhatsNewPreviewVisible(true)}>
            <Icon set="ion" name="construct-outline" size={16} color={colors.onboardingInk} />
            <TextElement style={styles.devButtonText}>Preview "What's new" modal</TextElement>
          </Ripple>
        )}
      </View>

      {isDEV && (
        <WhatsNewModal
          visible={whatsNewPreviewVisible}
          onDismiss={() => setWhatsNewPreviewVisible(false)}
          onHidden={() => setWhatsNewPreviewVisible(false)}
          ctx={{ screen: 'HOME' }}
        />
      )}
    </Layout>
  );
}

type SectionProps = {
  impact: ImpactStats;
  styles: ReturnType<typeof createStyles>;
};

function HeroCard({ impact, styles }: SectionProps) {
  const { count, preview } = impact.peopleHelped;
  const overflow = count - Math.min(preview.length, AVATAR_PREVIEW_LIMIT);

  return (
    <View style={styles.heroCard}>
      <TextElement style={styles.heroEyebrow}>THE GOOD YOU HAVE PUT IN</TextElement>

      {count > 0 ? (
        <>
          <TextElement style={styles.heroCount}>{count}</TextElement>
          <TextElement style={styles.heroBody}>
            {count === 1
              ? 'person crossed the finish line with your push behind them.'
              : 'people crossed the finish line with your push behind them.'}
          </TextElement>
          <Row align="center" style={styles.avatarStack}>
            {preview.slice(0, AVATAR_PREVIEW_LIMIT).map((person, index) => (
              <Avatar
                key={person.id}
                uri={person.photo}
                fallback={person.name}
                size={ms(34)}
                style={[styles.stackedAvatar, index > 0 && styles.stackedAvatarOverlap]}
              />
            ))}
            {overflow > 0 && (
              <View style={[styles.overflowChip, styles.stackedAvatarOverlap]}>
                <TextElement style={styles.overflowChipText}>+{overflow}</TextElement>
              </View>
            )}
          </Row>
        </>
      ) : (
        <>
          <TextElement style={styles.heroEmptyTitle}>Your first push is waiting.</TextElement>
          <TextElement style={styles.heroBody}>
            When someone you backed crosses the finish line, they will show up here.
          </TextElement>
        </>
      )}
    </View>
  );
}

function GivingSection({ impact, styles }: SectionProps) {
  const { peoplePushed, cheersSent, tasksBacked } = impact.giving;

  if (peoplePushed === 0 && cheersSent === 0 && tasksBacked === 0) {
    return null;
  }

  const stats = [
    { value: peoplePushed, label: peoplePushed === 1 ? 'person pushed' : 'people pushed' },
    { value: cheersSent, label: cheersSent === 1 ? 'cheer sent' : 'cheers sent' },
    { value: tasksBacked, label: tasksBacked === 1 ? 'goal backed' : 'goals backed' },
  ];

  return (
    <View style={styles.section}>
      <TextElement style={styles.sectionTitle}>How you showed up</TextElement>
      <Row style={styles.statsRow}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.statCard}>
            <TextElement style={styles.statValue}>{stat.value}</TextElement>
            <TextElement style={styles.statLabel}>{stat.label}</TextElement>
          </View>
        ))}
      </Row>
    </View>
  );
}

function TopCheerSection({ impact, styles }: SectionProps) {
  const topCheer = impact.topCheer;

  if (!topCheer) return null;

  const firstName = topCheer.recipient.name.trim().split(/\s+/)[0];

  return (
    <View style={styles.section}>
      <TextElement style={styles.sectionTitle}>Your push that mattered most</TextElement>
      <View style={styles.card}>
        <Row align="center" style={styles.cheerPersonRow}>
          <Avatar uri={topCheer.recipient.photo} fallback={topCheer.recipient.name} size={ms(42)} />
          <View style={styles.cheerPersonText}>
            <TextElement style={styles.cheerPersonName}>{topCheer.recipient.name}</TextElement>
            <TextElement style={styles.cheerGoalText} numberOfLines={2}>
              {topCheer.taskText}
            </TextElement>
          </View>
        </Row>
        <TextElement style={styles.cheerLine}>
          You cheered <TextElement style={styles.cheerQuote}>"{topCheer.cheerText}"</TextElement>
        </TextElement>
        <TextElement style={styles.cheerLine}>
          <TextElement style={styles.cheerOutcomeName}>{firstName}</TextElement> finished it{' '}
          {finishTiming(topCheer.daysToFinish)}.
        </TextElement>
      </View>
    </View>
  );
}

function JourneySection({ impact, styles, colors }: SectionProps & { colors: ThemeColors }) {
  const { tasksFinished, cheersReceived, pushesReceived } = impact.journey;

  if (tasksFinished === 0 && cheersReceived === 0 && pushesReceived === 0) {
    return null;
  }

  const rows = [
    { icon: 'checkmark' as const, label: 'Goals you finished', value: tasksFinished },
    { icon: 'heart-outline' as const, label: 'Cheers received', value: cheersReceived },
    { icon: 'flash-outline' as const, label: 'Pushes received', value: pushesReceived },
  ];

  return (
    <View style={styles.section}>
      <TextElement style={styles.sectionTitle}>Your own journey</TextElement>
      <View style={styles.card}>
        {rows.map((row, index) => (
          <Row
            key={row.label}
            align="center"
            justify="space-between"
            style={[styles.journeyRow, index === rows.length - 1 && styles.journeyRowLast]}
          >
            <Row align="center">
              <View style={styles.journeyIconTile}>
                <Icon set="ion" name={row.icon} size={15} color={colors.onboardingInk} />
              </View>
              <TextElement style={styles.journeyLabel}>{row.label}</TextElement>
            </Row>
            <TextElement style={styles.journeyValue}>{row.value}</TextElement>
          </Row>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: vs(10),
      paddingBottom: vs(36),
    },
    header: {
      marginBottom: vs(16),
    },
    privatePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(5),
      paddingHorizontal: ms(12),
      paddingVertical: vs(7),
      borderRadius: ms(16),
      backgroundColor: colors.onboardingLine,
    },
    privatePillText: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '700',
      color: colors.onboardingInkSoft,
      letterSpacing: 0,
    },
    copyBlock: {
      marginBottom: vs(18),
    },
    title: {
      fontSize: ms(28),
      lineHeight: ms(34),
      fontWeight: '900',
      color: colors.onboardingInk,
      letterSpacing: 0,
      marginBottom: vs(6),
    },
    subtitle: {
      fontSize: ms(15),
      lineHeight: ms(21),
      fontWeight: '500',
      color: colors.onboardingMuted,
      letterSpacing: 0,
    },
    loading: {
      minHeight: vs(220),
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroCard: {
      borderRadius: ms(24),
      backgroundColor: colors.onboardingPush,
      padding: spacing.lg,
      marginBottom: vs(6),
    },
    heroEyebrow: {
      fontSize: ms(11),
      lineHeight: ms(15),
      fontWeight: '800',
      letterSpacing: 1.4,
      color: HERO_INK_SOFT,
      marginBottom: vs(8),
    },
    heroCount: {
      fontSize: ms(62),
      lineHeight: ms(68),
      fontWeight: '900',
      color: HERO_INK,
      letterSpacing: -1,
    },
    heroEmptyTitle: {
      fontSize: ms(24),
      lineHeight: ms(30),
      fontWeight: '900',
      color: HERO_INK,
      letterSpacing: 0,
      marginBottom: vs(6),
    },
    heroBody: {
      fontSize: ms(18),
      lineHeight: ms(24),
      fontWeight: '700',
      color: HERO_INK,
      letterSpacing: 0,
      marginTop: vs(4),
    },
    avatarStack: {
      marginTop: vs(14),
    },
    stackedAvatar: {
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    stackedAvatarOverlap: {
      marginLeft: -ms(9),
    },
    overflowChip: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(17),
      backgroundColor: HERO_INK,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    overflowChipText: {
      fontSize: ms(11),
      lineHeight: ms(14),
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0,
    },
    section: {
      marginTop: vs(20),
    },
    sectionTitle: {
      fontSize: ms(18),
      lineHeight: ms(23),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
      marginBottom: vs(10),
    },
    statsRow: {
      gap: ms(10),
    },
    statCard: {
      flex: 1,
      borderRadius: ms(16),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      paddingVertical: vs(16),
      paddingHorizontal: ms(6),
      alignItems: 'center',
    },
    statValue: {
      fontSize: ms(22),
      lineHeight: ms(28),
      fontWeight: '900',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    statLabel: {
      marginTop: vs(3),
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '600',
      color: colors.onboardingMuted,
      letterSpacing: 0,
      textAlign: 'center',
    },
    card: {
      borderRadius: ms(20),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      padding: spacing.md,
    },
    cheerPersonRow: {
      marginBottom: vs(12),
    },
    cheerPersonText: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    cheerPersonName: {
      fontSize: ms(15),
      lineHeight: ms(20),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    cheerGoalText: {
      marginTop: vs(1),
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '600',
      color: colors.onboardingMuted,
      letterSpacing: 0,
    },
    cheerLine: {
      fontSize: ms(15),
      lineHeight: ms(22),
      fontWeight: '500',
      color: colors.onboardingInk,
      letterSpacing: 0,
      marginTop: vs(2),
    },
    cheerQuote: {
      fontSize: ms(15),
      lineHeight: ms(22),
      fontWeight: '800',
      color: colors.onboardingPushDeep,
      letterSpacing: 0,
    },
    cheerOutcomeName: {
      fontSize: ms(15),
      lineHeight: ms(22),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    journeyRow: {
      paddingVertical: vs(11),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.onboardingLine,
    },
    journeyRowLast: {
      borderBottomWidth: 0,
    },
    journeyIconTile: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(9),
      backgroundColor: colors.warmIconChipBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    journeyLabel: {
      fontSize: ms(14),
      lineHeight: ms(19),
      fontWeight: '700',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    journeyValue: {
      fontSize: ms(16),
      lineHeight: ms(21),
      fontWeight: '900',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    closingText: {
      marginTop: vs(28),
      fontSize: ms(14),
      lineHeight: ms(21),
      fontWeight: '500',
      color: colors.onboardingMuted,
      textAlign: 'center',
      letterSpacing: 0,
    },
    closingTextStrong: {
      fontSize: ms(14),
      lineHeight: ms(21),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    devButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(8),
      marginTop: vs(24),
      paddingVertical: vs(12),
      borderRadius: ms(14),
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.onboardingLine,
      backgroundColor: colors.surface,
    },
    devButtonText: {
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '700',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
  });
