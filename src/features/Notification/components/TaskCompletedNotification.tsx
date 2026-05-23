import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { notificationStyles } from '../styles/notification.styles';
import { Icon } from '@shared/components/Icons';
import { ms } from 'react-native-size-matters';
import { getTypeColor } from '@shared/utils/typeVisuals';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

function getSenderName(item: NotificationDTO) {
  return item.sender?.name || item.metadata?.senderName || 'Someone';
}

export default function TaskCompletedNotification({ item, onPress }: Props) {
  const senderName = getSenderName(item);
  const taskType = item.taskType || 'motivation';
  const typeColor = getTypeColor(taskType);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        notificationStyles.cardStyles,
        item.read ? notificationStyles.readCard : notificationStyles.unreadCard,
      ]}
    >
      <Avatar uri={item.sender?.photo || item.metadata?.senderPhoto} fallback={senderName} />

      <View style={styles.textContainer}>
        <TextElement variant="caption" style={notificationStyles.notifyText}>
          <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
            {senderName}
          </TextElement>{' '}
          completed a{' '}
          <TextElement
            variant="caption"
            weight="600"
            style={[notificationStyles.typeText, { color: typeColor, textTransform: 'capitalize' }]}
          >
            {taskType}
          </TextElement>{' '}
          you pushed
        </TextElement>

        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <Icon
        set="fa6"
        name="circle-check"
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
