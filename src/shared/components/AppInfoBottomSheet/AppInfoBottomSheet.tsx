import React, { forwardRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { spacing } from '@shared/theme';

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

const AppInfoBottomSheet = forwardRef<BottomSheet, Props>(
  ({ title, description, children }, ref) => {
    const snapPoints = useMemo(() => ['45%'], []);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={props => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
        )}
      >
        <View style={styles.content}>
          <TextElement variant="title" style={styles.title}>
            {title}
          </TextElement>

          {description && (
            <TextElement variant="body" color="muted">
              {description}
            </TextElement>
          )}

          {children}

          <PrimaryButton title="Got it" onPress={() => ref?.current?.close()} />
        </View>
      </BottomSheet>
    );
  },
);

export default AppInfoBottomSheet;

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontWeight: '700',
  },
});
