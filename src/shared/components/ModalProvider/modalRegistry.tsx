import React from 'react';

import InfoModalContent from './modals/InfoModalContent';
import ReminderMessageModalContent from './modals/ReminderMessageModalContent';
import { type ModalPayloadMap, type ModalType } from './modalTypes';

type RenderContext = {
  closeModal: () => void;
};

type ModalDefinition<K extends ModalType> = {
  snapPoints: string[];
  render: (payload: ModalPayloadMap[K], context: RenderContext) => React.ReactNode;
};

export const modalRegistry: { [K in ModalType]: ModalDefinition<K> } = {
  info: {
    snapPoints: ['25%'],
    render: payload => <InfoModalContent payload={payload} />,
  },
  reminderMessage: {
    snapPoints: ['68%'],
    render: (payload, { closeModal }) => (
      <ReminderMessageModalContent payload={payload} closeModal={closeModal} />
    ),
  },
};
