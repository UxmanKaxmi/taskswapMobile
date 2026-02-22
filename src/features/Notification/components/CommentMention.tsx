import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import { NotificationDTO } from '../types/notification.types';
import { notificationStyles } from '../styles/notification.styles';
import { Icon } from '@shared/components/Icons';
import { ms } from 'react-native-size-matters';

interface Props {
  item: NotificationDTO;
  onPress: () => void;
}

export default function CommentMention({ item, onPress }: Props) {
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
        <TextElement variant="body">
          <TextElement weight="bold">{item.sender?.name || 'Someone'}</TextElement> {item.message}
          {'\n'}
          <TextElement variant="body" style={styles.quotedText}>
            “{item.metadata?.commentText}”
          </TextElement>
        </TextElement>
        <TextElement variant="caption" color="muted">
          {timeAgo(item.createdAt)}
        </TextElement>
      </View>

      <Icon set="fa6" name="message" size={ms(20)} color={colors.muted} iconStyle="solid" />
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
});
