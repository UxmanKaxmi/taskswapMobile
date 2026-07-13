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

// All circle-* notification types. Member events (joined / update / took the
// win) lead with the sender's name; circle events (complete / dissolved) have
// no sender and lead with the message itself — never "Someone".
export default function CircleNotification({ item, onPress }: Props) {
  const notificationStyles = useNotificationStyles();
  const hasSender = Boolean(item.sender?.name);
  const quoted = item.metadata?.taskText;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <Avatar uri={item.sender?.photo} fallback={item.sender?.name?.[0] || '⭕'} />
      <View style={styles.textContainer}>
        <TextElement variant="body" style={notificationStyles.bodyText}>
          {hasSender ? (
            <>
              <TextElement weight="bold" style={notificationStyles.bodyText}>
                {item.sender?.name}
              </TextElement>{' '}
              {item.message}
            </>
          ) : (
            <TextElement weight="bold" style={notificationStyles.bodyText}>
              {item.message}
            </TextElement>
          )}
          {quoted ? (
            <>
              {'\n'}
              <TextElement variant="body" style={[notificationStyles.bodyText, styles.quotedText]}>
                “{quoted}”
              </TextElement>
            </>
          ) : null}
        </TextElement>
        <TextElement variant="caption" style={notificationStyles.bodyMetaText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>
      <NotificationIconBadge iconName="circle-nodes" />
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
