import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, platformShadow, spacing } from '@shared/theme';
import { getTypeColor, typeBackgrounds, typeBackgroundsHard } from '@shared/utils/typeVisuals';
import type { CompleteGoalConfirmationModalPayload } from '../modalTypes';

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
  payload: CompleteGoalConfirmationModalPayload;
  closeModal: () => void;
};

export default function CompleteGoalConfirmationModalContent({ payload, closeModal }: Props) {
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
              backgroundColor: colors.tactileMomentumPrimary,
            },
            platformShadow({
              color: shadowColor,
              opacity: 0.18,
              radius: 10,
              offset: { width: 0, height: 5 },
            }),
          ]}
        >
          <Icon
            set="fa6"
            name="circle-check"
            iconStyle="solid"
            size={30}
            color={colors.tactileMomentumSecondary}
          />
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
          backgroundColor={colors.tactileMomentumPrimary}
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
  primaryText: {
    color: colors.tactileMomentumSecondary,
  },
  cancelButton: {
    alignSelf: 'center',
    marginTop: vs(14),
    // paddingVertical: vs(4),
    color: colors.tactileMomentumSecondary,
  },
  cancelText: {
    color: colors.text,
    textAlign: 'center',
  },
});
