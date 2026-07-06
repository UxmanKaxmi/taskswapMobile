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

export default function GenericNotification({ item, onPress }: Props) {
  const notificationStyles = useNotificationStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <Avatar uri={item.sender?.photo} fallback={item.metadata?.senderName?.[0] || '?'} />
      <View style={styles.textContainer}>
        <TextElement variant="body" style={notificationStyles.bodyText}>
          <TextElement weight="bold" style={notificationStyles.bodyText}>
            {item.sender?.name || 'Someone'}
          </TextElement>{' '}
          {item.message || 'sent you a notification'}
          {'\n'}
          <TextElement variant="body" style={[notificationStyles.bodyText, styles.quotedText]}>
            “{item.metadata?.taskText}”
          </TextElement>
        </TextElement>
        <TextElement variant="caption" style={notificationStyles.bodyMetaText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>
      <NotificationIconBadge iconName="bell" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  quotedText: {
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
