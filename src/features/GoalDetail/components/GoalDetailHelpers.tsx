// src/features/tasks/components/GoalDetailHelpers.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { ms, vs } from 'react-native-size-matters';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import Column from '@shared/components/Layout/Column';

import { HelperUser } from '@features/Home/types/home';
import { GoalTypeEnum } from '@features/Goals/types/goals';

import TagHelperCard from '@features/AddGoal/components/TagHelperCard';
import GoalDetailHelpersRow from './GoalDetailHelpersRow';

type Props = {
  helpers: HelperUser[];
  taskType: GoalTypeEnum;
  isOwner: boolean;
  completed?: boolean;
  onPress?: () => void;
  onAddPress?: () => void;
  /** Goal owner's name — used for viewer-aware support copy. */
  ownerName?: string;
};

export default function GoalDetailHelpers({
  helpers,
  taskType,
  isOwner,
  completed = false,
  onPress,
  onAddPress,
  ownerName,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const hasHelpers = helpers.length > 0;
  const isMotivation = taskType === GoalTypeEnum.Motivation;

  if (completed) return null;

  if (!hasHelpers && isOwner) {
    return (
      <TagHelperCard
        helpers={helpers}
        onPress={onAddPress ?? onPress ?? (() => {})}
        taskType={taskType}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        label="Tag a friend"
        icon="people"
        iconColor={isMotivation ? colors.onboardingInk : undefined}
        labelColor={isMotivation ? colors.onboardingInk : undefined}
      />

      <Shadow size="tint">
        {/* ───────────── STATE 2: No helpers + NOT OWNER ───────────── */}
        {!hasHelpers && !isOwner && (
          <View style={styles.card}>
            <View style={styles.left}>
              <View style={styles.iconCircleMuted}>
                <Icon set="ion" name="people-outline" size={ms(18)} color={colors.muted} />
              </View>

              <Column flex={1} gap={2}>
                <TextElement variant="caption" style={styles.subTextHeading}>
                  No helpers yet
                </TextElement>

                <TextElement variant="caption" color="muted" style={styles.subText}>
                  Helpers will appear here when someone joins in
                </TextElement>
              </Column>
            </View>
          </View>
        )}

        {/* ───────────── STATE 3: Helpers + OWNER ───────────── */}
        {hasHelpers && isOwner && (
          <View style={styles.card}>
            <GoalDetailHelpersRow
              isOwner={isOwner}
              helpers={helpers}
              taskType={taskType}
              ownerName={ownerName}
              onPress={onPress ?? (() => {})}
            />
          </View>
        )}

        {/* ───────────── STATE 4: Helpers + NOT OWNER ───────────── */}
        {hasHelpers && !isOwner && (
          <View style={styles.card}>
            <GoalDetailHelpersRow
              isOwner={isOwner}
              helpers={helpers}
              taskType={taskType}
              ownerName={ownerName}
              onPress={onPress ?? (() => {})}
            />
          </View>
        )}
      </Shadow>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginTop: spacing.lg,
    },

    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
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

    iconCircleMuted: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.border,
    },

    subTextHeading: {
      fontSize: ms(13),
      fontWeight: '500',
    },

    subText: {
      fontSize: ms(11),
    },
  });
