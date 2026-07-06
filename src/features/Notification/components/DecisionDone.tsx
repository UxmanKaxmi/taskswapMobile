import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { useTypeVisuals } from '@shared/utils/typeVisuals';
import { useNotificationStyles } from '../styles/notification.styles';
import NotificationIconBadge from './NotificationIconBadge';

interface Props {
  item: NotificationDTO;
  onPress: () => void;
}

export default function DecisionDone({ item, onPress }: Props) {
  const notificationStyles = useNotificationStyles();
  const { getTypeColor } = useTypeVisuals();
  const typeColor = getTypeColor(item.taskType || 'decision');

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <Avatar
        uri={item.metadata?.senderPhoto || item?.sender?.photo}
        fallback={item.sender?.name}
      />
      <View style={styles.textContainer}>
        <TextElement variant="caption" style={notificationStyles.notifyText}>
          <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
            {item.metadata?.senderName || item?.sender?.name || 'Someone'}
          </TextElement>{' '}
          marked a{' '}
          <TextElement
            variant="caption"
            weight="600"
            style={[notificationStyles.typeText, { color: typeColor }]}
          >
            Decision
          </TextElement>{' '}
          as complete.
        </TextElement>
        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <NotificationIconBadge iconName="circle-check" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
