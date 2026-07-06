import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import { useNotificationStyles } from '../styles/notification.styles';
import type { NotificationDTO } from '../types/notification.types';
import { typeIcons } from '@shared/utils/typeVisuals';
import NotificationIconBadge from './NotificationIconBadge';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

const TITLE_BY_TYPE: Partial<Record<NotificationDTO['type'], string>> = {
  'task-motivation-unfinished-reminder': 'Your motivation is still waiting',
  'task-motivation-help-push-reminder': 'Someone could use a push today',
  'task-pushed-task-milestone': 'Your push is paying off',
};

export default function MotivationSystemNotification({ item, onPress }: Props) {
  const notificationStyles = useNotificationStyles();
  const iconName = typeIcons.motivation;
  const title = TITLE_BY_TYPE[item.type] ?? 'Motivation';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <NotificationIconBadge iconName={iconName} />

      <View style={styles.textContainer}>
        <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
          {title}
        </TextElement>

        <TextElement variant="caption" style={notificationStyles.bodyText} color="muted">
          {item.message}
        </TextElement>

        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
