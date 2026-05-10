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
    | 'task-motivation-milestone'
    | 'task-motivation-progress'
    | 'task-progress-update'
    | 'commentMention';

  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>; // Flexible for all notification types
  sender?: {
    id: string;
    name: string;
    photo?: string;
  };
  taskType?: 'reminder' | 'decision' | 'motivation' | 'advice';
}
