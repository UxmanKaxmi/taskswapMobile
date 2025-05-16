// src/types/task.ts
export type Task = {
  options: any;
  id: string;
  text: string;
  type: string;
  createdAt: string;
};

export type DecisionTask = {
  id: string;
  avatar: string; // image URI
  name: string;
  time: string;
  text: string;
  emoji?: string;
  options: string[]; // decision options
  type: string;
  createdAt: string;
};

export type ReminderTask = {
  id: string;
  avatar: string; // image URI
  name: string;
  time: string;
  text: string;
  emoji?: string;
  options: string[]; // decision options
  type: string;
  createdAt: string;
};
