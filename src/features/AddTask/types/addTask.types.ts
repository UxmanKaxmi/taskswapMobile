import type { FeelingValue } from '@shared/utils/feelings';
import { TaskType } from '@features/Tasks/types/tasks';

/**
 * Payload for creating a task.
 */
export interface CreateTaskPayload {
  text: string;
  type: TaskType;
  feeling?: FeelingValue;
  remindAt?: string; // For reminder tasks
  options?: string[]; // For decision tasks
  deliverAt?: string | null; // For motivation tasks
  helpers?: string[]; // IDs of users to assign as helpers
}
