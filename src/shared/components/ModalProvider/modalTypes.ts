import type { GoalType } from '@features/Goals/types/goals';
import type { ReportReason } from '@features/Reports';

export type InfoModalPayload = {
  title: string;
  description?: string;
};

export type ReminderMessageModalPayload = {
  taskName: string;
  taskText: string;
  onSend: (message: string) => void | Promise<void>;
  initialMessage?: string;
};

export type ShareUpdateModalPayload = {
  taskName: string;
  taskText: string;
  type: GoalType;
  onShare: (message: string) => void | Promise<void>;
  initialMessage?: string;
};

export type CheerModalPayload = {
  ownerName: string;
  taskText?: string;
  beatType: 'post' | 'update';
  onSelectPreset: (presetKey: string) => void | Promise<void>;
};

export type MotivationSuccessModalPayload = {
  type: GoalType;
  requestText?: string;
  text?: string;
  onDone: () => void;
  onViewRequest: () => void;
  onInviteHelper: () => void;
};

export type ComingSoonModalPayload = {
  type: GoalType;
  onCreateMotivation: () => void;
};

export type CompleteGoalConfirmationModalPayload = {
  type: GoalType;
  onConfirm: () => void | Promise<void>;
};

export type ReportTaskModalPayload = {
  ownerName?: string;
  taskText: string;
  onSubmit: (reason: ReportReason, details?: string) => void | Promise<void>;
};

export type AnonymousPostingInfoModalPayload = {
  userName: string;
  mode?: 'composer' | 'posted';
  onPostAnonymously?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  hideSecondaryAction?: boolean;
};

export type RevealGoalModalPayload = {
  onReveal: () => void | Promise<void>;
};

export type ModalPayloadMap = {
  info: InfoModalPayload;
  reminderMessage: ReminderMessageModalPayload;
  shareUpdate: ShareUpdateModalPayload;
  cheer: CheerModalPayload;
  motivationSuccess: MotivationSuccessModalPayload;
  comingSoon: ComingSoonModalPayload;
  completeGoalConfirmation: CompleteGoalConfirmationModalPayload;
  reportTask: ReportTaskModalPayload;
  anonymousPostingInfo: AnonymousPostingInfoModalPayload;
  revealGoal: RevealGoalModalPayload;
};

export type ModalType = keyof ModalPayloadMap;

export type ModalState =
  | {
      type: 'info';
      payload: InfoModalPayload;
    }
  | {
      type: 'reminderMessage';
      payload: ReminderMessageModalPayload;
    }
  | {
      type: 'shareUpdate';
      payload: ShareUpdateModalPayload;
    }
  | {
      type: 'cheer';
      payload: CheerModalPayload;
    }
  | {
      type: 'motivationSuccess';
      payload: MotivationSuccessModalPayload;
    }
  | {
      type: 'comingSoon';
      payload: ComingSoonModalPayload;
    }
  | {
      type: 'completeGoalConfirmation';
      payload: CompleteGoalConfirmationModalPayload;
    }
  | {
      type: 'reportTask';
      payload: ReportTaskModalPayload;
    }
  | {
      type: 'anonymousPostingInfo';
      payload: AnonymousPostingInfoModalPayload;
    }
  | {
      type: 'revealGoal';
      payload: RevealGoalModalPayload;
    }
  | null;
