import React from 'react';
import { Image, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ms, vs } from 'react-native-size-matters';
import AppModal from '@shared/components/AppModal/AppModal';
import TextElement from '@shared/components/TextElement/TextElement';
import { platformShadow, spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import PushButton from '@shared/components/PushButton/PushButton';

const LOGO = require('@assets/images/logo.png');

type LaunchModalShellProps = {
  visible: boolean;
  onDismiss: () => void;
  onHidden?: () => void;
  tag: string;
  title: string;
  body?: string;
  /** Custom body layout; takes precedence over the centered `body` text. */
  bodyContent?: React.ReactNode;
  note: string;
  ctaLabel: string;
  onCtaPress: () => void;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  ctaShadowColor?: string;
  minWidth?: number;
};

export default function LaunchModalShell({
  visible,
  onDismiss,
  onHidden,
  tag,
  title,
  body,
  bodyContent,
  note,
  ctaLabel,
  onCtaPress,
  ctaBackgroundColor,
  ctaTextColor,
  ctaShadowColor = 'rgba(15, 23, 42, 0.18)',
  minWidth = undefined,
}: LaunchModalShellProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      onDismiss={onHidden}
    >
      <LinearGradient
        colors={['#F8F5EC', '#FCF9F2', '#F6F2E6']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backdrop}
      >
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.backdropTouchLayer} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          <View pointerEvents="none" style={styles.glow} />

          <View style={styles.card}>
            <View style={styles.badgeWrap}>
              <View style={styles.badge}>
                <Image source={LOGO} resizeMode="contain" style={styles.logoImage} />
              </View>

              <View style={styles.tagPill}>
                <TextElement numberOfLines={1} style={[styles.tagText, { minWidth }]}>
                  {tag}
                </TextElement>
              </View>
            </View>

            <TextElement variant="title" style={styles.title}>
              {title}
            </TextElement>

            {bodyContent ?? (
              <TextElement style={styles.body} color="muted">
                {body}
              </TextElement>
            )}

            <TextElement style={styles.note}>{note}</TextElement>

            <PushButton
              size="lg"
              label={ctaLabel}
              onPress={onCtaPress}
              backgroundColor={ctaBackgroundColor ?? colors.onboardingPush}
              textColor={ctaTextColor ?? colors.tactileMomentumSecondary}
              style={[
                styles.ctaButton,
                platformShadow({
                  color: ctaShadowColor,
                  opacity: 0.18,
                  radius: 18,
                  offset: { width: 0, height: 10 },
                }),
              ]}
              textStyle={styles.ctaText}
            />
          </View>
        </View>
      </LinearGradient>
    </AppModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
    },
    backdropTouchLayer: {
      ...StyleSheet.absoluteFill,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingTop: vs(40),
      paddingBottom: vs(28),
    },
    glow: {
      position: 'absolute',
      width: ms(220),
      height: ms(220),
      borderRadius: ms(220),
      backgroundColor: 'rgba(255, 210, 63, 0.12)',
      top: '32%',
    },
    card: {
      width: '100%',
      maxWidth: ms(330),
      backgroundColor: colors.onboardingCard,
      borderRadius: ms(34),
      paddingHorizontal: ms(28),
      paddingTop: vs(50),
      paddingBottom: vs(28),
      ...platformShadow({
        color: '#000',
        opacity: 0.16,
        radius: 24,
        offset: { width: 0, height: 14 },
      }),
    },
    badgeWrap: {
      position: 'absolute',
      top: -vs(30),
      alignSelf: 'center',
      alignItems: 'center',
    },
    badge: {
      width: ms(98),
      height: ms(98),
      borderRadius: ms(28),
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      ...platformShadow({
        color: '#000',
        opacity: 0.12,
        radius: 16,
        offset: { width: 0, height: 10 },
      }),
    },
    logoImage: {
      width: ms(58),
      height: ms(58),
    },
    tagPill: {
      position: 'absolute',
      top: vs(4),
      right: -ms(56),
      backgroundColor: colors.onboardingPush,
      borderRadius: ms(18),
      paddingHorizontal: ms(16),
      paddingVertical: vs(6),
      transform: [{ rotate: '8deg' }],
      ...platformShadow({
        color: 'rgba(0,0,0,0.12)',
        opacity: 0.16,
        radius: 10,
        offset: { width: 0, height: 6 },
      }),
    },
    tagText: {
      color: colors.onboardingInk,
      fontSize: ms(14),
      fontWeight: '900',
      letterSpacing: 1,
    },
    title: {
      color: colors.onboardingInk,
      textAlign: 'center',
      fontSize: ms(28),
      lineHeight: ms(32),
      fontWeight: '900',
      marginTop: vs(20),
    },
    body: {
      textAlign: 'center',
      fontSize: ms(15),
      lineHeight: ms(20),
      color: colors.onboardingMuted,
      marginTop: vs(10),
      paddingHorizontal: ms(4),
    },
    note: {
      textAlign: 'center',
      marginTop: vs(15),
      color: colors.onboardingPushDeep,
      fontSize: ms(12),
      fontWeight: '900',
      letterSpacing: 1.4,
    },
    ctaButton: {
      // marginHorizontal: 0,
      // marginVertical: 0,
      marginTop: vs(15),
      borderRadius: ms(26),
      // minHeight: vs(68),
      // paddingVertical: vs(10),
      // paddingHorizontal: ms(28),
    },
    ctaText: {
      fontSize: ms(18),
      fontWeight: '800',
    },
  });
