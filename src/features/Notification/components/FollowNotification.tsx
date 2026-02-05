import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { notificationStyles } from '../styles/notification.styles';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

export default function FollowNotification({ item }: Props) {
  const { emoji } = getTypeVisual(item.type);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const handlePress = () => {
    navigation.navigate('FriendsProfileScreen', { id: item?.sender?.id ?? '' });
  };
  return (
    <TouchableOpacity onPress={handlePress} style={notificationStyles.cardStyles}>
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

      <TextElement variant="caption">{emoji}</TextElement>
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
});
