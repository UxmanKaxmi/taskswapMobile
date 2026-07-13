import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { spacing, useTheme } from '@shared/theme';
import { MODAL_TOP_RADIUS } from '@shared/constants/modal';

import {
  type ComingSoonModalPayload,
  type CheerModalPayload,
  type CircleMembersModalPayload,
  type InfoModalPayload,
  type ModalPayloadMap,
  type ModalState,
  type ModalType,
  type ReminderMessageModalPayload,
  type ReportTaskModalPayload,
  type ShareUpdateModalPayload,
} from './modalTypes';
import { modalRegistry } from './modalRegistry';

const BACKDROP_COLOR = 'rgba(0, 0, 0, 0.9)';

type ModalContextType = {
  openModal: <K extends ModalType>(type: K, payload: ModalPayloadMap[K]) => void;
  closeModal: () => void;
  openInfo: (payload: InfoModalPayload) => void;
  openReminderMessageSheet: (payload: ReminderMessageModalPayload) => void;
  openShareUpdateSheet: (payload: ShareUpdateModalPayload) => void;
  openCheerSheet: (payload: CheerModalPayload) => void;
  openComingSoonSheet: (payload: ComingSoonModalPayload) => void;
  openReportTaskSheet: (payload: ReportTaskModalPayload) => void;
  openCircleMembersSheet: (payload: CircleMembersModalPayload) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const activeModalRef = useRef<ModalState>(null);
  const nextCloseActionRef = useRef<'home' | 'custom'>('home');

  const closeModal = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const markNextCloseAsCustom = useCallback(() => {
    nextCloseActionRef.current = 'custom';
  }, []);

  const openModal = useCallback(<K extends ModalType>(type: K, payload: ModalPayloadMap[K]) => {
    const nextModal = { type, payload } as ModalState;
    activeModalRef.current = nextModal;
    nextCloseActionRef.current = 'home';
    setModal(nextModal);
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

  const openShareUpdateSheet = useCallback(
    (payload: ShareUpdateModalPayload) => {
      openModal('shareUpdate', payload);
    },
    [openModal],
  );

  const openCheerSheet = useCallback(
    (payload: CheerModalPayload) => {
      openModal('cheer', payload);
    },
    [openModal],
  );

  const openComingSoonSheet = useCallback(
    (payload: ComingSoonModalPayload) => {
      openModal('comingSoon', payload);
    },
    [openModal],
  );

  const openReportTaskSheet = useCallback(
    (payload: ReportTaskModalPayload) => {
      openModal('reportTask', payload);
    },
    [openModal],
  );

  const openCircleMembersSheet = useCallback(
    (payload: CircleMembersModalPayload) => {
      openModal('circleMembers', payload);
    },
    [openModal],
  );

  const onSheetDismiss = useCallback(() => {
    const closedModal = activeModalRef.current;
    const closeAction = nextCloseActionRef.current;

    activeModalRef.current = null;
    nextCloseActionRef.current = 'home';
    setModal(null);

    if (closedModal?.type === 'motivationSuccess' && closeAction === 'home') {
      closedModal.payload.onDone();
    }
  }, []);

  const sheetSnapPoints = useMemo(
    () => (modal ? modalRegistry[modal.type].snapPoints : ['45%']),
    [modal],
  );
  const sheetConfig = modal ? modalRegistry[modal.type] : null;
  const isScrollableModal = sheetConfig?.scrollable ?? false;
  const shouldFillContent = sheetConfig?.fillContent ?? false;
  const bottomSheetProps = sheetConfig?.bottomSheetProps;

  const renderedContent = useMemo(() => {
    if (!modal) return null;

    const modalEntry = modalRegistry[modal.type] as {
      render: (
        payload: unknown,
        context: { closeModal: () => void; markNextCloseAsCustom: () => void },
      ) => React.ReactNode;
    };

    return modalEntry.render(modal.payload, { closeModal, markNextCloseAsCustom });
  }, [modal, closeModal, markNextCloseAsCustom]);

  useEffect(() => {
    if (!modal) return;

    const timeout = globalThis.setTimeout(() => {
      sheetRef.current?.present();
    }, 0);

    return () => globalThis.clearTimeout(timeout);
  }, [modal]);

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        openInfo,
        openReminderMessageSheet,
        openShareUpdateSheet,
        openCheerSheet,
        openComingSoonSheet,
        openReportTaskSheet,
        openCircleMembersSheet,
      }}
    >
      {children}

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={sheetSnapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={true}
        {...bottomSheetProps}
        style={{
          borderTopLeftRadius: MODAL_TOP_RADIUS,
          borderTopRightRadius: MODAL_TOP_RADIUS,
          overflow: 'hidden',
        }}
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: MODAL_TOP_RADIUS,
          borderTopRightRadius: MODAL_TOP_RADIUS,
        }}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            style={{ backgroundColor: BACKDROP_COLOR }}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
            opacity={0.9}
          />
        )}
        onDismiss={onSheetDismiss}
      >
        {isScrollableModal ? (
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: spacing.md }}
            showsVerticalScrollIndicator={false}
          >
            {renderedContent}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView style={[{ padding: spacing.md }, shouldFillContent && { flex: 1 }]}>
            {renderedContent}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside ModalProvider');
  return ctx;
}
