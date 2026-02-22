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

export type ModalPayloadMap = {
  info: InfoModalPayload;
  reminderMessage: ReminderMessageModalPayload;
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
  | null;
