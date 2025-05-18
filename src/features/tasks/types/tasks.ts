// src/features/tasks/types/task.ts

// ✅ Define TaskType as a strict string union
export type TaskType = 'reminder' | 'decision' | 'motivation' | 'advice';

// ✅ Define Task object type (with the TaskType as a value)
export type Task = {
  id: string;
  text: string;
  type: TaskType;
  createdAt: string;
  remindAt?: string; // Only for reminder tasks
  options?: string[]; // Only for decision tasks
  deliverAt?: string; // Only for motivation tasks
  userId: string;
};

export const typeEmojis: Record<TaskType, string> = {
  reminder: '🕒',
  decision: '🧠',
  motivation: '🚀',
  advice: '💡',
};

// ✅ Define TaskPayload for creating a task
export interface TaskPayload {
  text: string;
  type: TaskType;
  remindAt?: string;
  options?: string[];
  deliverAt?: string;
}
