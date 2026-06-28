import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { getTypeColor, typeIcons } from '@shared/utils/typeVisuals';
import { notificationStyles } from '../styles/notification.styles';
import NotificationIconBadge from './NotificationIconBadge';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

export default function TaskAdviceNotification({ item, onPress }: Props) {
  const taskType = item.taskType || 'advice';

  const iconName = typeIcons[taskType];
  const typeColor = getTypeColor(taskType);

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
          {`replied to your `}
          <TextElement
            variant="caption"
            weight="600"
            style={[notificationStyles.typeText, { color: typeColor, textTransform: 'capitalize' }]}
          >
            {taskType}
          </TextElement>
        </TextElement>

        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <NotificationIconBadge iconName={iconName} />
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
