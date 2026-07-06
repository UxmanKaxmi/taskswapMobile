import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import GoalMetaRow from './GoalMetaRow';
import HelperAvatarGroup from './HelperAvatarGroup';
import { spacing, ThemeColors, useThemedStyles } from '@shared/theme';
import { timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { GoalTypeEnum } from '@features/Goals/types/goals';
import { HelperUser } from '../types/home';
import GoalModerationMenu from './GoalModerationMenu';

type Props = {
  avatar: string;
  name?: string;
  createdAt: string;
  type: GoalTypeEnum;
  helpers?: HelperUser[];
  avatarSize?: number;
  /** When provided, shows a report/block menu (hidden for the owner's own goal). */
  taskId?: string;
  ownerUserId?: string;
  taskText?: string;
};

export default function GoalHeader({
  avatar,
  name = 'John Doe',
  createdAt,
  type,
  helpers = [],
  avatarSize = ms(36),
  taskId,
  ownerUserId,
  taskText,
}: Props) {
  const styles = useThemedStyles(createStyles);

  return (
    <Row align="center" justify="space-between" fullWidth>
      <Row align="center" justify="flex-start" flex>
        {/* Avatar + helper overlay */}
        <View style={[styles.avatarWrapper, { width: avatarSize, height: avatarSize }]}>
          <Image
            source={{ uri: avatar }}
            style={[
              styles.ownerAvatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              },
            ]}
          />

          {helpers.length > 0 && (
            <HelperAvatarGroup
              helpers={helpers}
              avatarSize={ms(18)}
              containerStyle={styles.helperOverlay}
            />
          )}
        </View>

        {/* Name + meta */}
        <View>
          <TextElement variant="subtitle" style={styles.name}>
            {toShortName(name)}
          </TextElement>
          <GoalMetaRow type={type} timeAgo={timeAgo(createdAt)} />
        </View>
      </Row>

      {taskId ? (
        <GoalModerationMenu
          taskId={taskId}
          ownerUserId={ownerUserId}
          ownerName={name}
          taskText={taskText}
        />
      ) : null}
    </Row>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    avatarWrapper: {
      position: 'relative',
      marginRight: spacing.sm,
    },

    ownerAvatar: {
      backgroundColor: colors.muted,
    },

    helperOverlay: {
      position: 'absolute',
      bottom: ms(-4),
      right: ms(-6),
    },

    name: {
      fontSize: ms(16),
      lineHeight: ms(18),
      fontWeight: '600',
    },
  });
