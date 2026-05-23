import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ms } from 'react-native-size-matters';

import { Icon } from '@shared/components/Icons';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import { notificationStyles } from '../styles/notification.styles';
import type { NotificationDTO } from '../types/notification.types';
import { typeIcons } from '@shared/utils/typeVisuals';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

const TITLE_BY_TYPE: Partial<Record<NotificationDTO['type'], string>> = {
  'task-motivation-unfinished-reminder': 'Your motivation is still waiting',
  'task-motivation-help-push-reminder': 'Someone could use a push today',
};

export default function MotivationSystemNotification({ item, onPress }: Props) {
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
      <View style={styles.iconBubble}>
        <Icon
          set="fa6"
          name={iconName}
          iconStyle="solid"
          size={ms(18)}
          color={colors.motivationBgHardest}
        />
      </View>

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
  iconBubble: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.motivationIconBackground,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
