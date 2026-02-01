import React, { createContext, useContext, useRef, useState, useMemo } from 'react';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { colors, spacing } from '@shared/theme';
import { vs } from 'react-native-size-matters';

type InfoPayload = {
  title: string;
  description?: string;
};

type ContextType = {
  openInfo: (payload: InfoPayload) => void;
};

const AppInfoContext = createContext<ContextType | null>(null);

export function AppInfoBottomSheetProvider({ children }: { children: React.ReactNode }) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);

  const [content, setContent] = useState<InfoPayload | null>(null);

  const openInfo = (payload: InfoPayload) => {
    setContent(payload);
    requestAnimationFrame(() => {
      sheetRef.current?.snapToIndex(0);
    });
  };

  return (
    <AppInfoContext.Provider value={{ openInfo }}>
      {children}

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableHandlePanningGesture={false}
        backdropComponent={props => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
      >
        <BottomSheetView style={{ padding: spacing.md, gap: spacing.md, paddingBottom: vs(30) }}>
          {content && (
            <>
              <TextElement
                style={{
                  fontWeight: '600',
                }}
                variant="title"
                color="text"
              >
                {content.title}
              </TextElement>

              {content.description && (
                <TextElement variant="body" color="muted">
                  {content.description}
                </TextElement>
              )}

              {/* <PrimaryButton
                style={{
                  backgroundColor: colors.primary,
                }}
                title="Got it"
                onPress={() => sheetRef.current?.close()}
              /> */}
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </AppInfoContext.Provider>
  );
}

export function useAppInfo() {
  const ctx = useContext(AppInfoContext);
  if (!ctx) throw new Error('useAppInfo must be used inside AppInfoBottomSheetProvider');
  return ctx;
}
