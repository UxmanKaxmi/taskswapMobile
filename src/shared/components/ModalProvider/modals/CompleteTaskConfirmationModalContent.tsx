import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { getTypeColor, typeBackgrounds, typeBackgroundsHard } from '@shared/utils/typeVisuals';
import type { CompleteTaskConfirmationModalPayload } from '../modalTypes';

const CLOSE_ANIMATION_DELAY_MS = 260;

const COPY = {
  decision: {
    title: 'Finalize your decision?',
    body: 'This will lock voting and finalize the result.',
    confirmLabel: "I've decided",
    cancelLabel: 'Not yet',
  },
  reminder: {
    title: 'Mark this complete?',
    body: "You won't be able to add more progress updates after this.",
    confirmLabel: 'Mark complete',
    cancelLabel: 'Not yet',
  },
  motivation: {
    title: 'Mark this complete?',
    body: "You won't be able to add more progress updates after this.",
    confirmLabel: 'Mark complete',
    cancelLabel: 'Not yet',
  },
  advice: {
    title: 'Mark this complete?',
    body: "You won't be able to add more progress updates after this.",
    confirmLabel: 'Mark complete',
    cancelLabel: 'Not yet',
  },
} as const;

type Props = {
  payload: CompleteTaskConfirmationModalPayload;
  closeModal: () => void;
};

export default function CompleteTaskConfirmationModalContent({ payload, closeModal }: Props) {
  const copy = COPY[payload.type];
  const typeColor = getTypeColor(payload.type);
  const bubbleColor = typeBackgrounds[payload.type];
  const shadowColor = typeBackgroundsHard[payload.type];

  const handleConfirm = () => {
    closeModal();
    setTimeout(() => {
      void payload.onConfirm();
    }, CLOSE_ANIMATION_DELAY_MS);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View
          style={[
            styles.iconBubble,
            {
              backgroundColor: bubbleColor,
              shadowColor,
            },
          ]}
        >
          <Icon set="fa6" name="circle-check" iconStyle="solid" size={30} color={typeColor} />
        </View>
      </View>

      <TextElement variant="headline" weight="700" style={styles.title}>
        {copy.title}
      </TextElement>

      <TextElement variant="bodySmall" color="muted" style={styles.body}>
        {copy.body}
      </TextElement>

      <View style={styles.actions}>
        <PrimaryButton
          title={copy.confirmLabel}
          onPress={handleConfirm}
          backgroundColor={typeColor}
          style={styles.primaryButton}
          textStyle={styles.primaryText}
        />

        <Pressable onPress={closeModal} style={styles.cancelButton}>
          <TextElement variant="body" weight="700" style={styles.cancelText}>
            {copy.cancelLabel}
          </TextElement>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: spacing.md,
    // paddingHorizontal: spacing.md,
  },
  iconWrap: {
    // marginTop: vs(8),
    marginBottom: vs(18),
  },
  iconBubble: {
    width: ms(78),
    height: ms(78),
    borderRadius: ms(19),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    fontSize: ms(24),
    lineHeight: ms(28),
  },
  body: {
    textAlign: 'center',
    marginTop: vs(8),
    fontSize: ms(15),
    paddingHorizontal: spacing.sm,
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: 'auto',
    paddingTop: vs(16),
  },
  primaryButton: {
    alignSelf: 'stretch',
    marginVertical: 0,
    marginHorizontal: 0,
    borderRadius: 18,
    minHeight: 58,
  },
  primaryText: {},
  cancelButton: {
    alignSelf: 'center',
    marginTop: vs(14),
    // paddingVertical: vs(4),
  },
  cancelText: {
    color: colors.text,
    textAlign: 'center',
  },
});
