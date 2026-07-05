import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { notificationStyles } from '../styles/notification.styles';
import NotificationIconBadge from './NotificationIconBadge';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

export default function GoalMotivationNotification({ item, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <Avatar uri={item.sender?.photo} fallback={item.sender?.name} />

      <View style={styles.textContainer}>
        <TextElement variant="caption" style={notificationStyles.notifyText}>
          <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
            {item.sender?.name || 'Someone'}
          </TextElement>{' '}
          {'pushed you'}
        </TextElement>

        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <NotificationIconBadge iconName="bolt" />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
