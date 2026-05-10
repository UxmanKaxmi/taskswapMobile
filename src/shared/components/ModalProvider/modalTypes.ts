import type { TaskType } from '@features/Tasks/types/tasks';

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
  type: TaskType;
  onShare: (message: string) => void | Promise<void>;
  initialMessage?: string;
};

export type MotivationSuccessModalPayload = {
  type: TaskType;
  requestText?: string;
  text?: string;
  onDone: () => void;
  onViewRequest: () => void;
  onInviteHelper: () => void;
};

export type ComingSoonModalPayload = {
  type: TaskType;
  onCreateMotivation: () => void;
};

export type ModalPayloadMap = {
  info: InfoModalPayload;
  reminderMessage: ReminderMessageModalPayload;
  shareUpdate: ShareUpdateModalPayload;
  motivationSuccess: MotivationSuccessModalPayload;
  comingSoon: ComingSoonModalPayload;
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
      type: 'motivationSuccess';
      payload: MotivationSuccessModalPayload;
    }
  | {
      type: 'comingSoon';
      payload: ComingSoonModalPayload;
    }
  | null;
