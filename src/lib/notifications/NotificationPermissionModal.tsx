import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import AppModal from '@shared/components/AppModal/AppModal';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import Icon from '@shared/components/Icons/Icon';
import PushButton from '@shared/components/PushButton/PushButton';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, platformShadow, spacing } from '@shared/theme';

type Props = {
  visible: boolean;
  onTurnOnNotifications: () => void | Promise<void>;
  onNotNow: () => void | Promise<void>;
  onRequestClose: () => void | Promise<void>;
};

export default function NotificationPermissionModal({
  visible,
  onTurnOnNotifications,
  onNotNow,
  onRequestClose,
}: Props) {
  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <LinearGradient
        colors={['#F8F5EC', '#FCF9F2', '#F6F2E6']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backdrop}
      >
        <TouchableWithoutFeedback onPress={onNotNow}>
          <View style={styles.backdropTouchLayer} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          <View pointerEvents="none" style={styles.glow} />

          <View style={styles.card}>
            <View style={styles.badgeWrap}>
              <View style={styles.badge}>
                <Icon set="ion" name="notifications" size={ms(38)} color={colors.onboardingInk} />
              </View>

              <View style={styles.tagPill}>
                <TextElement style={styles.tagText}>PUSH</TextElement>
              </View>
            </View>

            <TextElement variant="title" style={styles.title}>
              Turn on push notifications?
            </TextElement>

            <TextElement style={styles.body}>
              We&apos;ll only notify you when someone pushes you, when your task needs attention, or
              when it&apos;s time to come back and finish.
            </TextElement>

            <TextElement style={styles.note}>NO NOISE. JUST PUSHES.</TextElement>

            <View style={styles.actions}>
              <PushButton
                size="lg"
                label="Turn on notifications"
                onPress={onTurnOnNotifications}
                backgroundColor={colors.onboardingPush}
                textColor={colors.onboardingInk}
                style={styles.ctaButton}
                textStyle={styles.ctaText}
              />

              <OutlineButton
                title="Not now"
                onPress={onNotNow}
                style={styles.secondaryButton}
                textStyle={styles.secondaryText}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  backdropTouchLayer: {
    ...StyleSheet.absoluteFillObject,
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
    maxWidth: ms(320),
    backgroundColor: colors.onboardingCard,
    borderRadius: ms(34),
    paddingHorizontal: ms(28),
    paddingTop: vs(58),
    paddingBottom: vs(22),
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
  tagPill: {
    position: 'absolute',
    top: vs(4),
    right: -ms(50),
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
    fontSize: ms(24),
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
  actions: {
    marginTop: vs(16),
  },
  ctaButton: {
    marginTop: vs(2),
    borderRadius: ms(26),
    ...platformShadow({
      color: 'rgba(15, 23, 42, 0.18)',
      opacity: 0.18,
      radius: 18,
      offset: { width: 0, height: 10 },
    }),
  },
  ctaText: {
    fontSize: ms(17),
    fontWeight: '800',
  },
  secondaryButton: {
    borderWidth: 0,
    alignSelf: 'stretch',
    marginTop: vs(-4),
  },
  secondaryText: {
    textAlign: 'center',
    color: colors.onboardingInk,
    fontWeight: '800',
  },
});
