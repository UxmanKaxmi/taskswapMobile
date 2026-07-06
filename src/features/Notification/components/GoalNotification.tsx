import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { useNotificationStyles } from '../styles/notification.styles';
import NotificationIconBadge from './NotificationIconBadge';
interface Props {
  item: NotificationDTO;
  onPress: () => void;
}

export default function GoalNotification({ item, onPress }: Props) {
  const notificationStyles = useNotificationStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <Avatar uri={item.metadata?.senderPhoto} fallback={item.metadata?.senderName?.[0]} />
      <View style={styles.textContainer}>
        <TextElement variant="body" style={notificationStyles.bodyText}>
          <TextElement weight="bold" style={notificationStyles.bodyText}>
            {item.metadata?.senderName || 'Someone'}
          </TextElement>{' '}
          shared a task
        </TextElement>
        <TextElement variant="caption" style={notificationStyles.bodyMetaText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>
      <NotificationIconBadge iconName="clipboard-list" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
