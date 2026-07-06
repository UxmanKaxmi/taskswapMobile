import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Avatar from '@shared/components/Avatar/Avatar';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, useTheme } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import type { NotificationDTO } from '../types/notification.types';
import { typeIcons, useTypeVisuals } from '@shared/utils/typeVisuals';
import { useNotificationStyles } from '../styles/notification.styles';
import NotificationIconBadge from './NotificationIconBadge';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

const taskTypeCopy: Record<
  string,
  {
    verb: string;
    preposition?: string;
    suffix?: string;
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
    verb: 'tagged you for a',
    preposition: '',
    suffix: undefined,
  },
  reminder: {
    verb: 'needs help with a reminder',
  },
};

export default function GoalTypeNotification({ item, onPress }: Props) {
  const { colors } = useTheme();
  const notificationStyles = useNotificationStyles();
  const { getTypeColor } = useTypeVisuals();
  const taskType = item.taskType || 'reminder';
  const isMotivation = taskType === 'motivation';

  const iconName = typeIcons[taskType];
  const typeColor = getTypeColor(taskType);

  const copy = taskTypeCopy[taskType] ?? {
    verb: 'needs your help',
    preposition: 'with',
  };
  const senderName = item.sender?.name || item.metadata?.senderName || 'Someone';

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
        {isMotivation ? (
          <>
            <TextElement variant="caption" style={notificationStyles.notifyText}>
              <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
                {senderName}
              </TextElement>{' '}
              tagged you for a{' '}
              <TextElement
                variant="caption"
                weight="600"
                style={[
                  notificationStyles.typeText,
                  { color: colors.tactileMomentumPrimary, textTransform: 'lowercase' },
                ]}
              >
                push
              </TextElement>
            </TextElement>

            <TextElement variant="caption" style={notificationStyles.bodyMetaText} color="muted">
              Push them forward · {timeAgo(item.createdAt)}
            </TextElement>
          </>
        ) : (
          <>
            <TextElement variant="caption" style={notificationStyles.notifyText}>
              <TextElement variant="caption" weight="bold" style={notificationStyles.nameText}>
                {senderName}
              </TextElement>{' '}
              {copy.verb}{' '}
              {copy.preposition !== undefined && (
                <>
                  {copy.preposition && `${copy.preposition} `}
                  <TextElement
                    variant="caption"
                    weight="600"
                    style={[
                      notificationStyles.typeText,
                      { textTransform: 'capitalize', color: typeColor },
                    ]}
                  >
                    {taskType}
                  </TextElement>
                </>
              )}
              {copy.suffix ? ` ${copy.suffix}` : null}
            </TextElement>

            <TextElement variant="caption" style={notificationStyles.timeAgoText} color="muted">
              {timeAgo(item.createdAt)}
            </TextElement>
          </>
        )}
      </View>

      <NotificationIconBadge iconName={isMotivation ? 'plus' : iconName} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
