import { TaskTypeEnum } from '@features/Tasks/types/tasks';

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

const TASK_TYPE_ORDER: TaskTypeEnum[] = [
  TaskTypeEnum.Motivation,
  TaskTypeEnum.Decision,
  TaskTypeEnum.Reminder,
  TaskTypeEnum.Advice,
];

export const getEnabledTaskTypes = (flags: FeatureFlags): TaskTypeEnum[] =>
  TASK_TYPE_ORDER.filter(type => {
    switch (type) {
      case TaskTypeEnum.Motivation:
        return flags.motivation;
      case TaskTypeEnum.Advice:
        return flags.advice;
      case TaskTypeEnum.Decision:
        return flags.decision;
      case TaskTypeEnum.Reminder:
        return flags.reminder;
      default:
        return false;
    }
  });
