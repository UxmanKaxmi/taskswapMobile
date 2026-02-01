// src/features/tasks/components/TaskDetailHelpers.tsx

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { ms, vs } from 'react-native-size-matters';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import Column from '@shared/components/Layout/Column';

import { HelperUser } from '@features/Home/types/home';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';

import TaskDetailHelpersRow from './TaskDetailHelpersRow';

type Props = {
  helpers: HelperUser[];
  taskType: TaskTypeEnum;
  isOwner: boolean;
  onPress?: () => void;
};

export default function TaskDetailHelpers({ helpers, taskType, isOwner, onPress }: Props) {
  const hasHelpers = helpers.length > 0;

  return (
    <View style={styles.wrapper}>
      <SectionHeader label="HELPERS" icon="people" />

      <Shadow size="tint">
        {/* ───────────── STATE 1: No helpers + OWNER ───────────── */}
        {!hasHelpers && isOwner && (
          <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.left}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: colors[`${taskType}IconBackground`] },
                ]}
              >
                <Icon
                  set="ion"
                  name="person-add"
                  size={ms(18)}
                  color={colors[`${taskType}BgHardest`]}
                />
              </View>

              <Column flex={1} gap={2}>
                <TextElement variant="caption" style={styles.subTextHeading}>
                  No supporters yet
                </TextElement>

                <TextElement variant="caption" color="muted" style={styles.subText}>
                  Invite someone you trust to support this task
                </TextElement>
              </Column>
            </View>
          </Pressable>
        )}

        {/* ───────────── STATE 2: No helpers + NOT OWNER ───────────── */}
        {!hasHelpers && !isOwner && (
          <View style={styles.card}>
            <View style={styles.left}>
              <View style={styles.iconCircleMuted}>
                <Icon set="ion" name="people-outline" size={ms(18)} color={colors.muted} />
              </View>

              <Column flex={1} gap={2}>
                <TextElement variant="caption" style={styles.subTextHeading}>
                  No supporters yet
                </TextElement>

                <TextElement variant="caption" color="muted" style={styles.subText}>
                  Supporters will appear here when someone joins in
                </TextElement>
              </Column>
            </View>
          </View>
        )}

        {/* ───────────── STATE 3: Helpers + OWNER ───────────── */}
        {hasHelpers && isOwner && (
          <View style={styles.card}>
            <TaskDetailHelpersRow
              isOwner={isOwner}
              helpers={helpers}
              taskType={taskType}
              onPress={onPress ?? (() => {})}
            />
          </View>
        )}

        {/* ───────────── STATE 4: Helpers + NOT OWNER ───────────── */}
        {hasHelpers && !isOwner && (
          <View style={styles.card}>
            <TaskDetailHelpersRow
              isOwner={isOwner}
              helpers={helpers}
              taskType={taskType}
              onPress={onPress ?? (() => {})}
            />
          </View>
        )}
      </Shadow>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.lg,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.onPrimary,
    borderRadius: 16,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
