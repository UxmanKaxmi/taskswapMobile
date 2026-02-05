import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { getTypeColor, getTypeVisual, typeIcons } from '@shared/utils/typeVisuals';
import { notificationStyles } from '../styles/notification.styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { ms } from 'react-native-size-matters';
import { Icon } from '@shared/components/Icons';

type Props = {
  item: NotificationDTO;
};

const taskTypeCopy: Record<
  string,
  {
    verb: string;
    preposition?: string;
  }
> = {
  decision: {
    verb: 'needs your help',
    preposition: 'on a',
  },
  advice: {
    verb: 'asked for',
    preposition: 'an ',
  },
  motivation: {
    verb: 'wants some',
    preposition: ' ',
  },
  reminder: {
    verb: 'needs help with a reminder',
  },
};

export default function TaskTypeNotification({ item }: Props) {
  const taskType = item.taskType || 'advice';
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const iconName = typeIcons[taskType];
  const typeColor = getTypeColor(taskType);

  const copy = taskTypeCopy[taskType] ?? {
    verb: 'needs your help',
    preposition: 'with',
  };

  const handlePress = () => {
    if (!item.metadata?.taskId) return;

    navigation.navigate('TaskDetail', {
      id: item.metadata.taskId,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={notificationStyles.cardStyles}>
      <Avatar uri={item.sender?.photo} fallback={item.sender?.name} />

      <View style={styles.textContainer}>
        <TextElement variant="caption" style={notificationStyles.notifyText}>
          <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
            {item.sender?.name || 'Someone'}
          </TextElement>{' '}
          {copy.verb}{' '}
          {copy.preposition && (
            <>
              {copy.preposition}{' '}
              <TextElement
                variant="caption"
                weight="600"
                style={{ textTransform: 'capitalize', color: typeColor }}
              >
                {taskType}
              </TextElement>
            </>
          )}
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
