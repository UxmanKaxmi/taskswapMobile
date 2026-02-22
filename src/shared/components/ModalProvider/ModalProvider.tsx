import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { spacing } from '@shared/theme';
import { vs } from 'react-native-size-matters';

import {
  type InfoModalPayload,
  type ModalPayloadMap,
  type ModalState,
  type ModalType,
  type ReminderMessageModalPayload,
} from './modalTypes';
import { modalRegistry } from './modalRegistry';

type ModalContextType = {
  openModal: <K extends ModalType>(type: K, payload: ModalPayloadMap[K]) => void;
  closeModal: () => void;
  openInfo: (payload: InfoModalPayload) => void;
  openReminderMessageSheet: (payload: ReminderMessageModalPayload) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const sheetRef = useRef<BottomSheet>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const closeModal = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const openModal = useCallback(<K extends ModalType>(type: K, payload: ModalPayloadMap[K]) => {
    setModal({ type, payload } as ModalState);

    setTimeout(() => {
      sheetRef.current?.snapToIndex(0);
    }, 0);
  }, []);

  const openInfo = useCallback(
    (payload: InfoModalPayload) => {
      openModal('info', payload);
    },
    [openModal],
  );

  const openReminderMessageSheet = useCallback(
    (payload: ReminderMessageModalPayload) => {
      openModal('reminderMessage', payload);
    },
    [openModal],
  );

  const onSheetChange = useCallback((index: number) => {
    if (index >= 0) return;
    setModal(null);
  }, []);

  const sheetSnapPoints = useMemo(
    () => (modal ? modalRegistry[modal.type].snapPoints : ['45%']),
    [modal],
  );
  const isReminderModal = modal?.type === 'reminderMessage';

  const renderedContent = useMemo(() => {
    if (!modal) return null;

    const modalEntry = modalRegistry[modal.type] as {
      render: (payload: unknown, context: { closeModal: () => void }) => React.ReactNode;
    };

    return modalEntry.render(modal.payload, { closeModal });
  }, [modal, closeModal]);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        openInfo,
        openReminderMessageSheet,
      }}
    >
      {children}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={sheetSnapPoints}
        enablePanDownToClose
        keyboardBehavior={isReminderModal ? 'extend' : 'interactive'}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={false}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        onChange={onSheetChange}
      >
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {renderedContent}
        </BottomSheetScrollView>
      </BottomSheet>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside ModalProvider');
  return ctx;
}
