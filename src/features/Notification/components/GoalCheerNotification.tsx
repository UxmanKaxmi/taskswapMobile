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

function getSenderName(item: NotificationDTO) {
  return item.sender?.name || item.metadata?.senderName || 'Someone';
}

function getCheeredSubject(item: NotificationDTO) {
  const beatType = String(item.metadata?.beatType || item.metadata?.type || '').toLowerCase();

  if (beatType === 'post') return 'task';
  if (beatType === 'update') return 'update';
  if (item.metadata?.progressUpdateId || item.metadata?.updateId) return 'update';

  const message = item.message?.toLowerCase() ?? '';
  if (message.includes('cheered your update')) return 'update';
  if (message.includes('cheered your task')) return 'task';

  return 'task';
}

export default function GoalCheerNotification({ item, onPress }: Props) {
  const senderName = getSenderName(item);
  const senderPhoto = item.sender?.photo || item.metadata?.senderPhoto;
  const cheeredSubject = getCheeredSubject(item);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <Avatar uri={senderPhoto} fallback={senderName} />

      <View style={styles.textContainer}>
        <TextElement variant="caption" style={notificationStyles.notifyText}>
          <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
            {senderName}
          </TextElement>{' '}
          cheered your {cheeredSubject}
        </TextElement>

        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <NotificationIconBadge iconName="bell" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
