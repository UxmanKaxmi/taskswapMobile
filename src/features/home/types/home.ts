// src/types/task.ts

export type BaseTask = {
  id: string;
  avatar: string; // image URI
  name: string;
  time: string;
  text: string;
  emoji?: string;
  type: string;
  createdAt: string;
  userId: string;
  completed: boolean; // ✅ from BaseTask
};

export type DecisionTask = BaseTask & {
  type: 'decision';
  options: string[];
};

export type ReminderTask = BaseTask & {
  type: 'reminder';
  remindAt: string; // ISO time to trigger
  hasReminded: boolean;
};

export type AdviceTask = BaseTask & {
  type: 'advice';
};

export type MotivationTask = BaseTask & {
  type: 'motivation';
  deliverAt?: string;
};

export type Task = DecisionTask | ReminderTask | AdviceTask | MotivationTask;
