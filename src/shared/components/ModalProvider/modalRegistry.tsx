import React from 'react';
import type { BottomSheetModalProps } from '@gorhom/bottom-sheet';

import InfoModalContent from './modals/InfoModalContent';
import ReminderMessageModalContent from './modals/ReminderMessageModalContent';
import ShareUpdateModalContent from './modals/ShareUpdateModalContent';
import MotivationSuccessModalContent from './modals/MotivationSuccessModalContent';
import ComingSoonModalContent from './modals/ComingSoonModalContent';
import CompleteTaskConfirmationModalContent from './modals/CompleteTaskConfirmationModalContent';
import { type ModalPayloadMap, type ModalType } from './modalTypes';

type RenderContext = {
  closeModal: () => void;
  markNextCloseAsCustom: () => void;
};

type ModalDefinition<K extends ModalType> = {
  snapPoints: Array<string | number>;
  scrollable?: boolean;
  fillContent?: boolean;
  bottomSheetProps?: Partial<
    Omit<
      BottomSheetModalProps,
      'children' | 'snapPoints' | 'backdropComponent' | 'onDismiss' | 'ref'
    >
  >;
  render: (payload: ModalPayloadMap[K], context: RenderContext) => React.ReactNode;
};

export const modalRegistry: { [K in ModalType]: ModalDefinition<K> } = {
  info: {
    snapPoints: ['25%'],
    render: payload => <InfoModalContent payload={payload} />,
  },
  reminderMessage: {
    snapPoints: ['60%'],
    scrollable: true,
    bottomSheetProps: {
      keyboardBehavior: 'extend',
    },
    render: (payload, { closeModal }) => (
      <ReminderMessageModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  shareUpdate: {
    snapPoints: [560],
    scrollable: true,
    bottomSheetProps: {
      keyboardBehavior: 'extend',
    },
    render: (payload, { closeModal }) => (
      <ShareUpdateModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  motivationSuccess: {
    snapPoints: ['55%'],
    render: (payload, { closeModal, markNextCloseAsCustom }) => (
      <MotivationSuccessModalContent
        markNextCloseAsCustom={markNextCloseAsCustom}
        payload={payload}
        closeModal={closeModal}
      />
    ),
  },
  comingSoon: {
    snapPoints: ['60%'],
    fillContent: true,
    bottomSheetProps: {
      enableDynamicSizing: false,
    },
    render: (payload, { closeModal }) => (
      <ComingSoonModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  completeTaskConfirmation: {
    snapPoints: [400],
    bottomSheetProps: {
      enableDynamicSizing: false,
    },
    render: (payload, { closeModal }) => (
      <CompleteTaskConfirmationModalContent payload={payload} closeModal={closeModal} />
    ),
  },
};
