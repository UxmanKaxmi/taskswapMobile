import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ms } from 'react-native-size-matters';

import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import TaskMetaRow from './TaskMetaRow';
import HelperAvatarGroup from './HelperAvatarGroup';
import { colors, spacing } from '@shared/theme';
import { timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import { HelperUser } from '../types/home';

type Props = {
  avatar: string;
  name?: string;
  createdAt: string;
  type: TaskTypeEnum;
  helpers?: HelperUser[];
  avatarSize?: number;
};

export default function TaskHeader({
  avatar,
  name = 'John Doe',
  createdAt,
  type,
  helpers = [],
  avatarSize = ms(36),
}: Props) {
  return (
    <Row align="center" justify="flex-start">
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
        <TaskMetaRow type={type} timeAgo={timeAgo(createdAt)} />
      </View>
    </Row>
  );
}

const styles = StyleSheet.create({
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
