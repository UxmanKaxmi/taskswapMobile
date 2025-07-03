// ✅ Define all task types strictly
export type TaskType = 'reminder' | 'decision' | 'motivation' | 'advice';

export type TaskHelper = {
  id: string;
  name: string;
  photo?: string;
};


export type Voter = {
  id: string;
  name: string;
  photo?: string;
};

// ✅ Shared fields for all tasks
export type BaseTask = {
  id: string;
  avatar?: string;
  name: string;
  text: string;
  type: TaskType;
  createdAt: string;
  userId: string;
  completed?: boolean;
  helpers: TaskHelper[];

  // UI-only enhancements
  time?: string;
  emoji?: string;
};

// ✅ Specific task types
export type ReminderTask = BaseTask & {
  type: 'reminder';
  remindAt: string;
  hasReminded: boolean;
  completed: boolean;
  completedAt?: string;
};

export type DecisionTask = BaseTask & {
  type: 'decision';
  options: string[];
  votes: {
    [option: string]: {
      count: number;
      preview: Voter[];
    };
  };
  votedOption?: string | null;
};

export type MotivationTask = BaseTask & {
  type: 'motivation';
  deliverAt?: string;
};

export type AdviceTask = BaseTask & {
  type: 'advice';
};

// ✅ Union of all tasks
export type Task = ReminderTask | DecisionTask | MotivationTask | AdviceTask;

// ✅ Reminder notes
export interface ReminderNoteDTO {
  id: string;
  taskId: string;
  senderId: string;
  message: string;
  createdAt: string;
  senderName: string;
  senderPhoto?: string | null;
}
