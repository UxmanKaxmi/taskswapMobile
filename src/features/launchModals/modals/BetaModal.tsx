import React, { useCallback, useMemo } from 'react';
import { Linking, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { colors, spacing } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import type { LaunchModalProps } from '../launchModals.registry';
import AppModal from '@shared/components/AppModal/AppModal';

export default function BetaModal({ visible, onDismiss, onHidden }: LaunchModalProps) {
  const navigation = useNavigation<any>();

  const handleSendFeedback = useCallback(async () => {
    const routeNames = navigation.getState?.()?.routeNames ?? [];

    if (routeNames.includes('Feedback')) {
      navigation.navigate('Feedback');
      onDismiss();
      return;
    }

    const mailto = 'mailto:feedback@pushmeup.app?subject=Push%20Me%20Up%20Beta%20Feedback';
    const canOpen = await Linking.canOpenURL(mailto);
    if (canOpen) {
      await Linking.openURL(mailto);
    }
    onDismiss();
  }, [navigation, onDismiss]);

  const dots = useMemo(() => [0, 1, 2], []);

  return (
    <AppModal
      visible={visible}
      style={{}}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      onDismiss={onHidden}
    >
      <LinearGradient
        colors={['#F4F1FF', '#EEE8FF', '#F6F3FF']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backdrop}
      >
        <TouchableWithoutFeedback onPress={onDismiss}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          {/* Outer panel */}

          {/* Soft dotted pattern */}
          <View pointerEvents="none" style={styles.dotsLayer}>
            {Array.from({ length: 42 }).map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>

          {/* Inner card */}
          <View style={styles.card}>
            {/* Floating icon badge */}
            <View style={styles.badgeWrap}>
              <View style={styles.badge}>
                <TextElement style={styles.badgeEmoji}>🚧</TextElement>
              </View>
            </View>

            <TextElement style={styles.title}>Heads up!{'\n'}We’re in Beta.</TextElement>

            <TextElement style={styles.body} color="muted">
              Push Me Up is still growing. You might run into a few bumps, but that’s where the
              magic happens! Your feedback helps us build the best community possible.
            </TextElement>

            <TextElement style={styles.thanks}>
              THANKS FOR BEING EARLY <TextElement style={styles.heart}>❤️</TextElement>
            </TextElement>

            <View style={styles.actions}>
              <PrimaryButton
                title="Let’s Go!"
                onPress={onDismiss}
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

  panel: {
    width: '100%',
    borderRadius: ms(24),
    padding: spacing.lg,
    borderWidth: 4,
    borderColor: '#5C8DFF',
    overflow: 'hidden',
  },

  dotsLayer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
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
    backgroundColor: '#FFFFFF',
    borderRadius: ms(26),
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginTop: vs(70),
  },

  badgeWrap: {
    position: 'absolute',
    top: -vs(26),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badge: {
    width: ms(54),
    height: ms(54),
    borderRadius: ms(16),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  badgeEmoji: {
    fontSize: ms(22),
  },

  title: {
    fontSize: ms(22),
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: ms(30),
    color: '#0F172A',
    marginTop: vs(18),
  },
  body: {
    fontSize: ms(13),
    lineHeight: ms(19),
    textAlign: 'center',
    marginTop: vs(10),
    color: '#475569',
  },
  thanks: {
    marginTop: vs(18),
    textAlign: 'center',
    fontSize: ms(11),
    letterSpacing: 1.2,
    fontWeight: '800',
    color: '#8B7CFF',
  },
  heart: {
    color: '#EF4444',
    fontWeight: '900',
  },

  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: vs(10),
  },
  secondaryBtn: {
    flex: 1,
    height: vs(46),
    borderRadius: ms(24),
    backgroundColor: '#F1EEFF',
    borderWidth: 1,
    borderColor: '#E6E0FF',
  },
  secondaryText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#6D4DFF',
  },

  primaryBtn: {
    flex: 1,
    // height: vs(46),
    // borderRadius: ms(24),
    // backgroundColor: '#6D4DFF',
  },
  primaryText: {
    fontSize: ms(13),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  pagination: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: ms(8),
    marginTop: vs(22),
  },
  pageDot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(7),
    backgroundColor: '#D7D2FF',
  },
  pageDotActive: {
    backgroundColor: '#B7ADFF',
  },
});
