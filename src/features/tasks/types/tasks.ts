// ✅ Define all possible task types
export type TaskType = 'reminder' | 'decision' | 'motivation' | 'advice';

// ✅ Full Task object (received from API)
export type Task = {
  id: string;
  text: string;
  type: TaskType;
  createdAt: string;
  userId: string;
  remindAt?: string; // for reminder tasks
  options?: string[]; // for decision tasks
  deliverAt?: string; // for motivation tasks
  avatar?: string;
  name?: string;
};

// ✅ Payload used for task creation
export interface TaskPayload {
  text: string;
  type: TaskType;
  remindAt?: string;
  options?: string[];
  deliverAt?: string;
  avatar?: string;
  name?: string;
}

// ✅ Payload used for task updates (partial and flexible)
export interface UpdateTaskInput {
  id: string;
  data: Partial<{
    text: string;
    type: TaskType;
    remindAt?: string;
    options?: string[];
    deliverAt?: string | null;
    avatar?: string;
    name?: string;
  }>;
}
