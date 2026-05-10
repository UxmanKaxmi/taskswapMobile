import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { getTypeColor, typeIcons } from '@shared/utils/typeVisuals';
import { notificationStyles } from '../styles/notification.styles';
import { ms } from 'react-native-size-matters';
import { Icon } from '@shared/components/Icons';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

export default function TaskProgressUpdateNotification({ item, onPress }: Props) {
  const taskType = item.taskType || 'motivation';
  const senderName = item.sender?.name || item.metadata?.senderName || 'Someone';
  const senderPhoto = item.sender?.photo || item.metadata?.senderPhoto;
  const typeColor = getTypeColor(taskType);
  const iconName = typeIcons[taskType];

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
          shared progress on his{' '}
          <TextElement
            variant="caption"
            weight="600"
            style={[notificationStyles.typeText, { color: typeColor, textTransform: 'capitalize' }]}
          >
            {taskType}
          </TextElement>{' '}
          task
        </TextElement>

        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <Icon
        set="fa6"
        name={iconName}
        size={ms(20)}
        color={typeColor}
        iconStyle="solid"
        style={styles.icon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  icon: {
    marginRight: ms(5),
  },
});
