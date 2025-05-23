type VisualInfo = {
  emoji: string;
  color: string;
};

type NotificationType =
  | 'reminder'
  | 'decision'
  | 'motivation'
  | 'advice'
  | 'follow'
  | 'comment'
  | 'task';

export const notificationTypeVisuals: Record<NotificationType, VisualInfo> = {
  reminder: { emoji: '🕒', color: '#FF9800' },
  decision: { emoji: '🧠', color: '#00BCD4' },
  motivation: { emoji: '🚀', color: '#4CAF50' },
  advice: { emoji: '💡', color: '#FFC107' },
  follow: { emoji: '➕', color: '#4CAF50' },
  comment: { emoji: '💬', color: '#2196F3' },
  task: { emoji: '📝', color: '#9C27B0' },
};

export function getNotificationTypeVisual(type: string): VisualInfo {
  return (
    notificationTypeVisuals[type as NotificationType] || {
      emoji: '🔔',
      color: '#9E9E9E',
    }
  );
}
