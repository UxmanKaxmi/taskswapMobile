import type { FeelingValue } from '@shared/utils/feelings';
import { GoalType } from '@features/Goals/types/goals';

/**
 * Payload for creating a task.
 */
export interface CreateGoalPayload {
  text: string;
  type: GoalType;
  feeling?: FeelingValue;
  remindAt?: string; // For reminder tasks
  options?: string[]; // For decision tasks
  deliverAt?: string | null; // For motivation tasks
  helpers?: string[]; // IDs of users to assign as helpers
  isAnonymous?: boolean; // Post under a generated alias
}
