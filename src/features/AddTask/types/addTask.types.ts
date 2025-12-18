import { TaskType } from '@features/Tasks/types/tasks';

/**
 * Payload for creating a task.
 */
export interface CreateTaskPayload {
  text: string;
  type: TaskType;
  remindAt?: string; // For reminder tasks
  options?: string[]; // For decision tasks
  deliverAt?: string | null; // For motivation tasks
  helperIds?: string[]; // IDs of users to assign as helpers
  visibility?: 'friends' | 'public' | 'private'; // Task visibility
}
