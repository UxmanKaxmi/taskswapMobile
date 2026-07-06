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
import type { AnonymousPostingInfoModalPayload } from '../modalTypes';

const CLOSE_ANIMATION_DELAY_MS = 260;

type Props = {
  payload: AnonymousPostingInfoModalPayload;
  closeModal: () => void;
};

const POINTS: Array<{ icon: string; text: string }> = [
  {
    icon: 'user-secret',
    text: 'Your goal gets a generated alias. Nobody sees your name, photo, or profile.',
  },
  {
    icon: 'eye-slash',
    text: "It never shows on your profile, and you can't tag friends on it.",
  },
  {
    icon: 'heart',
    text: 'Pushes still come from real, named people rooting for you.',
  },
  {
    icon: 'lock',
    text: 'Once posted anonymously, this goal stays anonymous.',
  },
];

const POSTED_POINTS: Array<{ icon: string; text: string }> = [
  {
    icon: 'user-secret',
    text: 'This goal is posted under a generated alias. Nobody sees your name, photo, or profile.',
  },
  {
    icon: 'eye-slash',
    text: "It doesn't show on your profile, and friends can't be tagged on it.",
  },
  {
    icon: 'heart',
    text: 'Pushes still come from real, named people rooting for you.',
  },
  {
    icon: 'lock',
    text: 'This goal was posted anonymously, so it stays anonymous.',
  },
];

export default function AnonymousPostingInfoModalContent({ payload, closeModal }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const isPostedMode = payload.mode === 'posted';
  const title = isPostedMode ? 'Posted anonymously' : 'Post without your name';
  const points = isPostedMode ? POSTED_POINTS : POINTS;

  const handleConfirm = () => {
    closeModal();
    if (!payload.onPostAnonymously) return;

    setTimeout(() => {
      payload.onPostAnonymously?.();
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
            name="user-secret"
            iconStyle="solid"
            size={30}
            color={colors.tactileMomentumSecondary}
          />
        </View>
      </View>

      <TextElement variant="headline" weight="700" style={styles.title}>
        {title}
      </TextElement>

      <View style={styles.points}>
        {points.map(point => (
          <View key={point.icon} style={styles.pointRow}>
            <View style={styles.pointIconWrap}>
              <Icon
                set="fa6"
                name={point.icon}
                iconStyle="solid"
                size={ms(15)}
                color={colors.muted}
              />
            </View>
            <TextElement variant="bodySmall" color="muted" style={styles.pointText}>
              {point.text}
            </TextElement>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title={payload.primaryActionLabel ?? 'Post anonymously'}
          onPress={handleConfirm}
          backgroundColor={colors.tactileMomentumPrimary}
          style={styles.primaryButton}
          textStyle={styles.primaryText}
        />

        {!payload.hideSecondaryAction ? (
          <Pressable onPress={closeModal} style={styles.cancelButton}>
            <TextElement variant="body" weight="700" style={styles.cancelText}>
              {payload.secondaryActionLabel ?? 'Keep my name on it'}
            </TextElement>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    iconWrap: {
      marginBottom: vs(14),
    },
    iconBubble: {
      width: ms(70),
      height: ms(70),
      borderRadius: ms(18),
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      fontSize: ms(22),
      lineHeight: ms(26),
    },
    points: {
      alignSelf: 'stretch',
      marginTop: vs(16),
      gap: vs(14),
      paddingHorizontal: spacing.xs,
    },
    pointRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    pointIconWrap: {
      width: ms(30),
      alignItems: 'flex-start',
      paddingTop: vs(2),
    },
    pointText: {
      flex: 1,
      fontSize: ms(13.5),
      lineHeight: ms(19),
      letterSpacing: -0.1,
    },
    actions: {
      alignSelf: 'stretch',
      paddingTop: vs(20),
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
