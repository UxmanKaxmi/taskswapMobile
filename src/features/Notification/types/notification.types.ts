export interface NotificationDTO {
  id: string;
  userId: string;
  type:
    | 'remainder'
    | 'decision'
    | 'motivation'
    | 'advice'
    | 'follow'
    | 'comment'
    | 'task'
    | 'task-helper'
    | 'reminder'
    | 'decision-done'
    | 'task-advice'
    | 'task-motivation-push'
    | 'task-cheer'
    | 'task-motivation-cheer'
    | 'task-motivation-milestone'
    | 'task-pushed-task-milestone'
    | 'task-motivation-progress'
    | 'task-motivation-unfinished-reminder'
    | 'task-motivation-help-push-reminder'
    | 'task-progress-update'
    | 'commentMention'
    | 'task-completed';

  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any> | null; // Flexible for all notification types
  sender?: {
    id: string;
    name: string;
    photo?: string | null;
  } | null;
  taskType?: 'reminder' | 'decision' | 'motivation' | 'advice' | null;
}
