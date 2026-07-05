import type { GoalType } from '@features/Goals/types/goals';
import type { ReportReason } from '@features/Reports';

export type InfoModalPayload = {
  title: string;
  description?: string;
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

export type CompleteGoalConfirmationModalPayload = {
  type: GoalType;
  onConfirm: () => void | Promise<void>;
};

export type ReportTaskModalPayload = {
  ownerName?: string;
  taskText: string;
  onSubmit: (reason: ReportReason, details?: string) => void | Promise<void>;
};

export type ModalPayloadMap = {
  info: InfoModalPayload;
  shareUpdate: ShareUpdateModalPayload;
  cheer: CheerModalPayload;
  motivationSuccess: MotivationSuccessModalPayload;
  completeGoalConfirmation: CompleteGoalConfirmationModalPayload;
  reportTask: ReportTaskModalPayload;
};

export type ModalType = keyof ModalPayloadMap;

export type ModalState =
  | {
      type: 'info';
      payload: InfoModalPayload;
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
      type: 'completeGoalConfirmation';
      payload: CompleteGoalConfirmationModalPayload;
    }
  | {
      type: 'reportTask';
      payload: ReportTaskModalPayload;
    }
  | null;
