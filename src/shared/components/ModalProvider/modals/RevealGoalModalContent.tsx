import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import {
  platformShadow,
  spacing,
  type ThemeColors,
  useTheme,
  useThemedStyles,
} from '@shared/theme';
import type { RevealGoalModalPayload } from '../modalTypes';

const CLOSE_ANIMATION_DELAY_MS = 260;

type Props = {
  payload: RevealGoalModalPayload;
  closeModal: () => void;
};

export default function RevealGoalModalContent({ payload, closeModal }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const handleReveal = () => {
    closeModal();
    setTimeout(() => {
      void payload.onReveal();
    }, CLOSE_ANIMATION_DELAY_MS);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: colors.tactileMomentumPrimary },
            platformShadow({
              color: '#000',
              opacity: 0.15,
              radius: 10,
              offset: { width: 0, height: 5 },
            }),
          ]}
        >
          <Icon
            set="fa6"
            name="trophy"
            iconStyle="solid"
            size={30}
            color={colors.tactileMomentumSecondary}
          />
        </View>
      </View>

      <TextElement variant="headline" weight="700" style={styles.title}>
        Take the win as yourself?
      </TextElement>

      <TextElement variant="bodySmall" color="muted" style={styles.body}>
        You did this anonymously, but you still did it. Put your name on it and let everyone who
        pushed you see who they helped.
      </TextElement>

      <View style={styles.actions}>
        <PrimaryButton
          title="Reveal my name"
          onPress={handleReveal}
          backgroundColor={colors.tactileMomentumPrimary}
          style={styles.primaryButton}
          textStyle={styles.primaryText}
        />

        <Pressable onPress={closeModal} style={styles.cancelButton}>
          <TextElement variant="body" weight="700" style={styles.cancelText}>
            Stay anonymous
          </TextElement>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingBottom: spacing.lg,
    },
    iconWrap: {
      marginBottom: vs(16),
    },
    iconBubble: {
      width: ms(74),
      height: ms(74),
      borderRadius: ms(18),
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      fontSize: ms(23),
      lineHeight: ms(27),
    },
    body: {
      textAlign: 'center',
      marginTop: vs(8),
      fontSize: ms(15),
      lineHeight: ms(20),
      paddingHorizontal: spacing.sm,
    },
    actions: {
      alignSelf: 'stretch',
      paddingTop: vs(18),
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
    },
    cancelText: {
      color: colors.text,
      textAlign: 'center',
    },
  });
