import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ms, vs } from 'react-native-size-matters';

import { AppNavigationProp } from '@navigation/types/navigation';
import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import Layout from '@shared/components/Layout/Layout';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { CHANGELOG, ChangelogChange, ChangelogEntry, ChangeType } from '../data/changelog';

// The latest-release card stays brand-yellow in both themes, so its ink is fixed.
const HERO_INK = '#16171F';
const HERO_INK_SOFT = 'rgba(22, 23, 31, 0.55)';
const HERO_TILE_BG = 'rgba(255, 255, 255, 0.55)';
const EMOJI_TILE_SIZE = ms(30);

const CHANGE_TYPE_ORDER: ChangeType[] = ['new', 'improved', 'fixed'];

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  new: 'NEW',
  improved: 'IMPROVED',
  fixed: 'FIXED',
};

const CHANGE_ICON_MAP: Record<string, { set: 'fa6' | 'ion'; name: string }> = {
  '✨': { set: 'fa6', name: 'wand-magic-sparkles' },
  '👆': { set: 'fa6', name: 'hand-point-up' },
  '🧹': { set: 'fa6', name: 'broom' },
  '🌙': { set: 'fa6', name: 'moon' },
  '⚡': { set: 'fa6', name: 'bolt' },
  '🛡️': { set: 'fa6', name: 'shield-halved' },
  '🚀': { set: 'fa6', name: 'rocket' },
  '🐛': { set: 'fa6', name: 'bug' },
  '🎯': { set: 'fa6', name: 'bullseye' },
  '🔑': { set: 'fa6', name: 'key' },
  '🎨': { set: 'fa6', name: 'palette' },
};

function groupChanges(changes: ChangelogChange[]) {
  return CHANGE_TYPE_ORDER.map(type => ({
    type,
    items: changes.filter(change => change.type === type),
  })).filter(group => group.items.length > 0);
}

function ChangeIcon({ emoji, color }: { emoji: string; color: string }) {
  const icon = CHANGE_ICON_MAP[emoji] ?? CHANGE_ICON_MAP['✨'];

  return (
    <Icon
      set={icon.set}
      name={icon.name}
      iconStyle="solid"
      size={ms(15)}
      color={color}
      style={stylesIconReset.icon}
    />
  );
}

export default function ChangelogScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<AppNavigationProp>();

  const [latest, ...older] = CHANGELOG;

  return (
    <Layout
      scrollable
      allowPaddingVertical={false}
      allowPaddingHorizontal={false}
      backgroundColor={colors.onboardingPaper}
    >
      <View style={styles.content}>
        <Row align="center" justify="flex-start" style={styles.header}>
          <Ripple style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon set="ion" name="chevron-back" size={22} color={colors.onboardingInk} />
          </Ripple>
        </Row>

        <View style={styles.copyBlock}>
          <TextElement style={styles.title}>What's new ✨</TextElement>
          <TextElement style={styles.subtitle}>
            Everything we have shipped, release by release.
          </TextElement>
        </View>

        {latest && <LatestReleaseCard entry={latest} styles={styles} />}

        {older.map(entry => (
          <ReleaseCard key={entry.version} entry={entry} styles={styles} />
        ))}
      </View>
    </Layout>
  );
}

type CardProps = {
  entry: ChangelogEntry;
  styles: ReturnType<typeof createStyles>;
};

function LatestReleaseCard({ entry, styles }: CardProps) {
  return (
    <View style={styles.heroCard}>
      <TextElement style={styles.heroEyebrow}>
        LATEST · {entry.version} · {entry.date.toUpperCase()}
      </TextElement>
      <TextElement style={styles.heroTitle}>{entry.title}</TextElement>
      <View style={styles.heroChanges}>
        {entry.changes.map(change => (
          <Row
            key={change.text}
            align="flex-start"
            justify="flex-start"
            gap={ms(12)}
            style={styles.changeRow}
          >
            <View style={[styles.emojiTile, styles.emojiTileHero]}>
              <ChangeIcon emoji={change.emoji} color={HERO_INK_SOFT} />
            </View>
            <View style={styles.changeTextColumn}>
              <TextElement style={styles.heroChangeText}>{change.text}</TextElement>
            </View>
          </Row>
        ))}
      </View>
    </View>
  );
}

function ReleaseCard({ entry, styles }: CardProps) {
  const { colors } = useTheme();
  const groups = groupChanges(entry.changes);

  return (
    <View style={styles.card}>
      <Row align="center" justify="space-between">
        <TextElement style={styles.cardTitle}>{entry.title}</TextElement>
        <TextElement style={styles.cardMeta}>{entry.date}</TextElement>
      </Row>
      <TextElement style={styles.cardVersion}>{entry.version}</TextElement>

      {groups.map(group => (
        <View key={group.type}>
          <TextElement style={[styles.groupLabel, group.type === 'new' && styles.groupLabelNew]}>
            {CHANGE_TYPE_LABELS[group.type]}
          </TextElement>
          {group.items.map(change => (
            <Row
              key={change.text}
              align="flex-start"
              justify="flex-start"
              gap={ms(12)}
              style={styles.changeRow}
            >
              <View
                style={[
                  styles.emojiTile,
                  group.type === 'new' ? styles.emojiTileNew : styles.emojiTileNeutral,
                ]}
              >
                <ChangeIcon
                  emoji={change.emoji}
                  color={group.type === 'new' ? colors.onboardingPushDeep : colors.onboardingMuted}
                />
              </View>
              <View style={styles.changeTextColumn}>
                <TextElement style={styles.changeText}>{change.text}</TextElement>
              </View>
            </Row>
          ))}
        </View>
      ))}
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
    backButton: {
      width: ms(42),
      height: ms(42),
      borderRadius: ms(21),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
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
    heroCard: {
      borderRadius: ms(24),
      backgroundColor: colors.onboardingPush,
      padding: spacing.lg,
      marginBottom: vs(14),
    },
    heroEyebrow: {
      fontSize: ms(11),
      lineHeight: ms(15),
      fontWeight: '800',
      letterSpacing: 1.2,
      color: HERO_INK_SOFT,
      marginBottom: vs(6),
    },
    heroTitle: {
      fontSize: ms(24),
      lineHeight: ms(30),
      fontWeight: '900',
      color: HERO_INK,
      letterSpacing: 0,
    },
    heroChanges: {
      marginTop: vs(10),
    },
    heroChangeText: {
      fontSize: ms(14),
      lineHeight: ms(18),
      fontWeight: '700',
      color: HERO_INK,
      letterSpacing: 0,
    },
    card: {
      borderRadius: ms(20),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      padding: spacing.md,
      marginBottom: vs(12),
    },
    cardTitle: {
      flex: 1,
      fontSize: ms(16),
      lineHeight: ms(21),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
      marginRight: spacing.sm,
    },
    cardMeta: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '600',
      color: colors.onboardingMuted,
      letterSpacing: 0,
    },
    cardVersion: {
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '700',
      color: colors.onboardingInkSoft,
      letterSpacing: 0,
    },
    groupLabel: {
      fontSize: ms(10),
      lineHeight: ms(14),
      fontWeight: '800',
      letterSpacing: 0.8,
      color: colors.onboardingMuted,
      marginTop: vs(12),
      marginBottom: vs(2),
    },
    groupLabelNew: {
      color: colors.onboardingPushDeep,
    },
    changeRow: {
      marginTop: vs(8),
      width: '100%',
    },
    emojiTile: {
      width: EMOJI_TILE_SIZE,
      height: EMOJI_TILE_SIZE,
      borderRadius: ms(9),
      alignItems: 'center',
      justifyContent: 'center',
    },
    changeTextColumn: {
      flex: 1,
      minHeight: EMOJI_TILE_SIZE,
      justifyContent: 'center',
      flexShrink: 1,
    },
    emojiTileHero: {
      backgroundColor: HERO_TILE_BG,
    },
    emojiTileNew: {
      backgroundColor: colors.warmIconChipBg,
    },
    emojiTileNeutral: {
      backgroundColor: colors.onboardingLine,
    },
    changeText: {
      fontSize: ms(14),
      lineHeight: ms(18),
      fontWeight: '600',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
  });

const stylesIconReset = StyleSheet.create({
  icon: {
    marginTop: 0,
    padding: 0,
  },
});
