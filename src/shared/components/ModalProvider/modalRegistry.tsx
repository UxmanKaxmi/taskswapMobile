import React from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import InfoModalContent from './modals/InfoModalContent';
import ReminderMessageModalContent from './modals/ReminderMessageModalContent';
import ShareUpdateModalContent from './modals/ShareUpdateModalContent';
import CheerModalContent from './modals/CheerModalContent';
import MotivationSuccessModalContent from './modals/MotivationSuccessModalContent';
import ComingSoonModalContent from './modals/ComingSoonModalContent';
import CompleteGoalConfirmationModalContent from './modals/CompleteGoalConfirmationModalContent';
import ReportTaskModalContent from './modals/ReportTaskModalContent';
import AnonymousPostingInfoModalContent from './modals/AnonymousPostingInfoModalContent';
import RevealGoalModalContent from './modals/RevealGoalModalContent';
import CircleMembersModalContent from './modals/CircleMembersModalContent';
import CirclesIntroModalContent from './modals/CirclesIntroModalContent';
import { type ModalPayloadMap, type ModalType } from './modalTypes';

type RenderContext = {
  closeModal: () => void;
  markNextCloseAsCustom: () => void;
};

type ModalDefinition<K extends ModalType> = {
  snapPoints: Array<string | number>;
  scrollable?: boolean;
  fillContent?: boolean;
  bottomSheetProps?: Partial<React.ComponentProps<typeof BottomSheetModal>>;
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
    render: (payload, { closeModal }) => (
      <ReminderMessageModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  shareUpdate: {
    snapPoints: ['62%'],
    scrollable: true,
    bottomSheetProps: {
      android_keyboardInputMode: 'adjustPan',
      keyboardBehavior: 'interactive',
    },
    render: (payload, { closeModal }) => (
      <ShareUpdateModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  cheer: {
    snapPoints: ['80%'],
    scrollable: true,
    render: (payload, { closeModal }) => (
      <CheerModalContent payload={payload} closeModal={closeModal} />
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
    render: (payload, { closeModal }) => (
      <ComingSoonModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  completeGoalConfirmation: {
    snapPoints: [400],
    render: (payload, { closeModal }) => (
      <CompleteGoalConfirmationModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  reportTask: {
    snapPoints: ['62%'],
    scrollable: true,
    render: (payload, { closeModal }) => (
      <ReportTaskModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  // No fixed snap points: enableDynamicSizing opens these at content height,
  // so the CTA is never clipped below the fold on any device.
  anonymousPostingInfo: {
    snapPoints: [],
    render: (payload, { closeModal }) => (
      <AnonymousPostingInfoModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  revealGoal: {
    snapPoints: [],
    render: (payload, { closeModal }) => (
      <RevealGoalModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  circleMembers: {
    snapPoints: ['45%'],
    scrollable: true,
    render: (payload, { closeModal }) => (
      <CircleMembersModalContent payload={payload} closeModal={closeModal} />
    ),
  },
  circlesIntro: {
    snapPoints: [],
    render: (payload, { closeModal }) => (
      <CirclesIntroModalContent payload={payload} closeModal={closeModal} />
    ),
  },
};
