// src/features/Notification/components/NotificationCard.tsx
import React from 'react';
import FollowNotification from './FollowNotification';
import ReminderNotification from './ReminderNotification';
import TaskNotification from './TaskNotification';
import DefaultNotification from './DefaultNotification';

import type { NotificationDTO } from '../types/notification.types';

type Props = {
  item: NotificationDTO;
  onPress: () => void;
};

export default function NotificationCard({ item, onPress }: Props) {
  switch (item.type) {
    case 'follow':
      return <FollowNotification item={item} onPress={onPress} />;
    case 'reminder':
      return <ReminderNotification item={item} onPress={onPress} />;
    case 'task':
      return <TaskNotification item={item} onPress={onPress} />;
    default:
      return <DefaultNotification item={item} onPress={onPress} />;
  }
}
