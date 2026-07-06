// src/features/Notification/components/NotificationCard.tsx
import React from 'react';
import FollowNotification from './FollowNotification';
import ReminderNotification from './ReminderNotification';
import GoalNotification from './GoalNotification';

import type { NotificationDTO } from '../types/notification.types';
import GenericNotification from './GenericNotification';
import DecisionDone from './DecisionDone';
import CommentMention from './CommentMention';
import GoalTypeNotification from './GoalTypeNotification';
import GoalAdviceNotification from './GoalAdviceNotification';
import GoalMotivationNotification from './GoalMotivationNotification';
import GoalProgressUpdateNotification from './GoalProgressUpdateNotification';
import GoalCompletedNotification from './GoalCompletedNotification';
import MotivationSystemNotification from './MotivationSystemNotification';
import GoalCheerNotification from './GoalCheerNotification';

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
      return <GoalNotification item={item} onPress={onPress} />;
    case 'task-helper':
      return <GoalTypeNotification item={item} onPress={onPress} />;
    case 'decision-done':
      return <DecisionDone item={item} onPress={onPress} />;
    case 'comment':
      return <CommentMention item={item} onPress={onPress} />;
    case 'task-advice':
      return <GoalAdviceNotification item={item} onPress={onPress} />;
    case 'task-motivation-push':
      return <GoalMotivationNotification item={item} onPress={onPress} />;
    case 'task-motivation-milestone':
      return <GoalMotivationNotification item={item} onPress={onPress} />;
    case 'task-completed':
      return <GoalCompletedNotification item={item} onPress={onPress} />;
    case 'task-motivation-progress':
    case 'task-progress-update':
      return <GoalProgressUpdateNotification item={item} onPress={onPress} />;
    case 'task-cheer':
    case 'task-motivation-cheer':
      return <GoalCheerNotification item={item} onPress={onPress} />;
    case 'task-motivation-unfinished-reminder':
    case 'task-motivation-help-push-reminder':
    case 'task-pushed-task-milestone':
      return <MotivationSystemNotification item={item} onPress={onPress} />;

    default:
      return <GenericNotification item={item} onPress={onPress} />;
  }
}
