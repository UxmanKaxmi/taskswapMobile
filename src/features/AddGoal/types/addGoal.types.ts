import type { FeelingValue } from '@shared/utils/feelings';
import { GoalType } from '@features/Goals/types/goals';

/**
 * Payload for creating a task.
 */
export interface CreateGoalPayload {
  text: string;
  type: GoalType;
  feeling?: FeelingValue;
  deliverAt?: string | null;
  helpers?: string[]; // IDs of users to assign as helpers
}
