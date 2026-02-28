import React, { useCallback } from 'react';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { spacing } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import type { LaunchModalProps } from '../launchModals.registry';
import AppModal from '@shared/components/AppModal/AppModal';

export default function AddFriendsModal({ visible, onDismiss, onHidden }: LaunchModalProps) {
  const navigation = useNavigation<any>();

  const handleFindFriends = useCallback(() => {
    onDismiss();
    navigation.navigate('FindFriendsScreen', { openedFromHome: true });
  }, [navigation, onDismiss]);

  return (
    <AppModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      onDismiss={onHidden}
    >
      {/* Backdrop gradient (same family as Beta modal) */}
      <LinearGradient
        colors={['#F4F1FF', '#EEE8FF', '#F6F3FF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backdrop}
      >
        {/* Tap outside to dismiss */}
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.backdropTapLayer} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          {/* Soft dotted pattern like your beta modal (very subtle) */}
          <View pointerEvents="none" style={styles.dotsLayer}>
            {Array.from({ length: 42 }).map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Floating icon badge */}
            <View style={styles.badgeWrap}>
              <View style={styles.badge}>
                {/* Using emoji to match beta approach; swap to Icon if you prefer */}
                <TextElement style={styles.badgeEmoji}>👥</TextElement>
              </View>
            </View>

            <TextElement style={styles.title}>Find your people</TextElement>

            <TextElement style={styles.body} color="muted">
              Add a few friends who can support your tasks and keep you moving.
            </TextElement>

            <View style={styles.actions}>
              {/* <OutlineButton
                title="Maybe later"
                onPress={onDismiss}
                style={styles.secondaryBtn}
                textStyle={styles.secondaryText}
              /> */}

              <PrimaryButton
                title="Find friends"
                onPress={handleFindFriends}
                style={styles.primaryBtn}
                textStyle={styles.primaryText}
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
  backdropTapLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: vs(30),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  dotsLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: ms(14),
  },
  dot: {
    width: ms(2.5),
    height: ms(2.5),
    borderRadius: ms(2),
    backgroundColor: '#9CA3AF',
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(28),
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
    marginTop: vs(70),
  },

  badgeWrap: {
    position: 'absolute',
    top: -vs(28),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badge: {
    width: ms(60),
    height: ms(60),
    borderRadius: ms(30),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  badgeEmoji: {
    fontSize: ms(22),
  },

  title: {
    fontSize: ms(24),
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: ms(30),
    color: '#0F172A',
    marginTop: vs(18),
  },
  body: {
    fontSize: ms(14),
    lineHeight: ms(20),
    textAlign: 'center',
    marginTop: vs(10),
    color: '#475569',
    paddingHorizontal: ms(4),
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: vs(18),
  },

  // Make it look like the screenshot: left button softer + pill,
  // right button stronger + pill + shadow.
  secondaryBtn: {
    flex: 1,
    height: vs(48),
    borderRadius: ms(26),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E9E7F5',
  },
  secondaryText: {
    fontSize: ms(13),
    fontWeight: '800',
    color: '#64748B',
  },

  primaryBtn: {
    flex: 1,
    // height: vs(48),
    borderRadius: ms(26),
    // PrimaryButton already applies theme bg; keep shadow here for the “lift”
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  primaryText: {
    fontSize: ms(13),
    fontWeight: '900',
    color: '#FFFFFF',
  },

  handleWrap: {
    alignItems: 'center',
    marginTop: vs(14),
  },
  handle: {
    width: ms(44),
    height: vs(4),
    borderRadius: vs(4),
    backgroundColor: '#E7E5EF',
    opacity: 0.9,
  },
});
