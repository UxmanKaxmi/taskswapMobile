import { GoalTypeEnum } from '@features/Goals/types/goals';

export type FeatureFlags = {
  motivation: boolean;
  advice: boolean;
  decision: boolean;
  reminder: boolean;
};

export type FeatureFlagsResponse = {
  features?: Partial<FeatureFlags>;
} & Partial<FeatureFlags>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  motivation: true,
  advice: true,
  decision: true,
  reminder: true,
};

export const normalizeFeatureFlags = (raw?: Partial<FeatureFlags> | null): FeatureFlags => ({
  ...DEFAULT_FEATURE_FLAGS,
  ...(raw ?? {}),
});

const TASK_TYPE_ORDER: GoalTypeEnum[] = [
  GoalTypeEnum.Motivation,
  GoalTypeEnum.Decision,
  GoalTypeEnum.Reminder,
  GoalTypeEnum.Advice,
];

export const getEnabledGoalTypes = (flags: FeatureFlags): GoalTypeEnum[] =>
  TASK_TYPE_ORDER.filter(type => {
    switch (type) {
      case GoalTypeEnum.Motivation:
        return flags.motivation;
      case GoalTypeEnum.Advice:
        return flags.advice;
      case GoalTypeEnum.Decision:
        return flags.decision;
      case GoalTypeEnum.Reminder:
        return flags.reminder;
      default:
        return false;
    }
  });
