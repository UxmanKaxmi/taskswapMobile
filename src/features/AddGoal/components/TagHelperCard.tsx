import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import Avatar from '@shared/components/Avatar/Avatar';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { ms, vs } from 'react-native-size-matters';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import HelpersRow from './HelpersRow';
import { HelperUser } from '@features/Home/types/home';
import { getHelperHints } from '../utils/goalCopy';
import { GoalTypeEnum } from '@features/Goals/types/goals';
import Column from '@shared/components/Layout/Column';

type Props = {
  onPress: () => void;
  helpers: HelperUser[];
  taskType: GoalTypeEnum;
  variant?: 'default' | 'prompt';
  headerLabel?: string;
  headerSuffix?: string;
  title?: string;
  subtitle?: string;
};

export default function TagHelperCard({
  helpers,
  onPress,
  taskType,
  variant = 'default',
  headerLabel,
  headerSuffix,
  title,
  subtitle,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const hasHelpers = helpers.length > 0;

  if (variant === 'prompt') {
    return (
      <View style={styles.promptWrapper}>
        <View style={styles.promptHeaderRow}>
          <TextElement variant="label" weight="700" style={styles.promptHeaderLabel}>
            {headerLabel ?? 'TAG A FRIEND'}
          </TextElement>
          <TextElement variant="label" weight="500" style={styles.promptHeaderSuffix}>
            {headerSuffix ?? 'optional'}
          </TextElement>
        </View>

        <Pressable style={styles.promptCard} onPress={onPress}>
          {!hasHelpers ? (
            <>
              <View style={styles.promptLeft}>
                <View style={styles.promptIconCircle}>
                  <Icon
                    set="ion"
                    name="add"
                    size={ms(22)}
                    color={colors.tactileMomentumSecondary}
                  />
                </View>

                <View style={styles.promptTextWrap}>
                  <TextElement variant="subtitle" weight="700" style={styles.promptTitle}>
                    {title ?? 'Tag someone who keeps you honest'}
                  </TextElement>
                  <TextElement variant="body" color="muted" style={styles.promptSubtitle}>
                    {subtitle ?? "They'll get a nudge to push you."}
                  </TextElement>
                </View>
              </View>

              <Icon set="ion" name="chevron-forward" size={ms(18)} color={colors.muted} />
            </>
          ) : (
            <>
              <View style={styles.promptLeft}>
                <View
                  style={[
                    styles.promptIconCircle,
                    { backgroundColor: colors.tactileMomentumPrimary },
                  ]}
                >
                  <Icon
                    set="ion"
                    name="people"
                    size={ms(20)}
                    color={colors.tactileMomentumSecondary}
                  />
                </View>

                <View style={styles.promptTextWrap}>
                  <TextElement variant="subtitle" weight="700" style={styles.promptTitle}>
                    Who can help?
                  </TextElement>
                  <TextElement variant="body" color="muted" style={styles.promptSubtitle}>
                    {formatHelperNames(helpers)}
                  </TextElement>
                </View>
              </View>

              <View style={styles.promptAvatars}>
                {helpers.slice(0, 3).map((helper, index) => (
                  <View key={helper.id} style={{ marginLeft: index === 0 ? 0 : -ms(10) }}>
                    <Avatar uri={helper.photo} fallback={helper.name?.[0] ?? '?'} size={28} />
                  </View>
                ))}
              </View>

              <Icon set="ion" name="chevron-forward" size={ms(18)} color={colors.muted} />
            </>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <SectionHeader label="Tag a friend" icon="people" />

      <Shadow size="tint">
        <Pressable style={styles.card} onPress={onPress}>
          <View style={styles.left}>
            {!hasHelpers ? (
              <>
                <View
                  style={[styles.iconCircle, { backgroundColor: colors.tactileMomentumPrimary }]}
                >
                  <Icon
                    set="ion"
                    name="add"
                    size={ms(16)}
                    color={colors.tactileMomentumSecondary}
                  />
                </View>

                <Column flex={1} gap={1}>
                  <TextElement variant="caption" style={styles.subTextHeading}>
                    Choose someone to help.
                  </TextElement>

                  <TextElement variant="caption" color="muted" style={styles.subText}>
                    {getHelperHints(taskType)}
                  </TextElement>
                </Column>
              </>
            ) : (
              <HelpersRow taskType={taskType} helpers={helpers} onPress={onPress} />
            )}
          </View>

          {/* <Icon set="ion" name="chevron-forward" size={ms(18)} color={colors.muted} /> */}
        </Pressable>
      </Shadow>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    promptWrapper: {
      marginTop: spacing.lg,
    },
    promptHeaderRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: ms(8),
      marginBottom: vs(12),
    },
    promptHeaderLabel: {
      color: colors.onboardingMuted,
      letterSpacing: 0.8,
    },
    promptHeaderSuffix: {
      color: colors.onboardingMuted,
      opacity: 0.9,
      fontSize: ms(12),
    },
    promptCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.onboardingPaper,
      borderRadius: 26,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.onboardingLine,
      paddingVertical: vs(10),
      paddingHorizontal: ms(18),
    },
    promptLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(16),
      flex: 1,
      paddingRight: ms(12),
    },
    promptIconCircle: {
      width: ms(38),
      height: ms(38),
      borderRadius: ms(19),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
    },
    promptTextWrap: {
      flex: 1,
    },
    promptAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.sm,
      paddingLeft: ms(10),
    },
    promptTitle: {
      color: colors.onboardingInk,
      fontSize: ms(12),
      lineHeight: ms(18),
      letterSpacing: -0.3,
    },
    promptSubtitle: {
      marginTop: vs(4),
      fontSize: ms(12),
      lineHeight: ms(12),
    },
    wrapper: {
      marginTop: spacing.md,
    },

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: spacing.md,
      paddingVertical: vs(10),
    },

    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },

    iconCircle: {
      width: ms(35),
      height: ms(35),
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },

    subText: {
      fontSize: ms(11),
    },
    subTextHeading: {
      fontSize: ms(13),
      fontWeight: '500',
    },
  });

function formatHelperNames(helpers: HelperUser[]) {
  if (helpers.length === 1) return helpers[0].name;
  if (helpers.length === 2) return `${helpers[0].name} & ${helpers[1].name}`;
  if (helpers.length === 3) return `${helpers[0].name}, ${helpers[1].name} & ${helpers[2].name}`;
  return `${helpers[0].name}, ${helpers[1].name} +${helpers.length - 2}`;
}
