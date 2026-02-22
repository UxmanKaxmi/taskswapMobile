import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { notificationStyles } from '../styles/notification.styles';
import { Icon } from '@shared/components/Icons';
import { ms } from 'react-native-size-matters';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

export default function FollowNotification({ item, onPress }: Props) {
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
          followed you
        </TextElement>
        <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <Icon
        style={styles.icon}
        set="fa6"
        name="user"
        size={ms(20)}
        color={colors.muted}
        iconStyle="solid"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {},
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  icon: {
    marginRight: ms(5),
  },
});
