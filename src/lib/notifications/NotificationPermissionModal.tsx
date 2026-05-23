import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import AppModal from '@shared/components/AppModal/AppModal';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';

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
        colors={[colors.motivationIconBackground, colors.motivationBg, '#F7FFF9']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backdrop}
      >
        <TouchableWithoutFeedback onPress={onNotNow}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.badgeWrap}>
              <View style={styles.badge}>
                <Icon
                  set="ion"
                  name="notifications"
                  size={ms(24)}
                  color={colors.motivationBgHardest}
                />
              </View>
            </View>

            <TextElement style={styles.title}>Want to know when someone pushes you?</TextElement>

            <TextElement style={styles.body} color="muted">
              Turn on notifications so you don&apos;t miss support.
            </TextElement>

            <View style={styles.actions}>
              <PrimaryButton
                title="Turn on notifications"
                onPress={onTurnOnNotifications}
                backgroundColor={colors.motivationBgHardest}
                style={styles.primaryButton}
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
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: vs(24),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: ms(26),
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    marginTop: vs(62),
    borderWidth: 1,
    borderColor: '#D6F8E6',
  },
  badgeWrap: {
    position: 'absolute',
    top: -vs(24),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badge: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(16),
    backgroundColor: colors.motivationIconBackground,
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
  title: {
    fontSize: ms(21),
    lineHeight: ms(28),
    textAlign: 'center',
    color: colors.text,
    marginTop: vs(16),
    fontWeight: '800',
  },
  body: {
    fontSize: ms(13),
    lineHeight: ms(19),
    textAlign: 'center',
    marginTop: vs(10),
  },
  actions: {
    marginTop: vs(18),
    // gap: vs(8),
  },
  primaryButton: {
    alignSelf: 'stretch',
    borderRadius: 18,
    marginBottom: 0,
  },
  secondaryButton: {
    borderWidth: 0,
    alignSelf: 'stretch',
  },
  secondaryText: {
    textAlign: 'center',
    color: colors.motivationBgHardest,
  },
});
