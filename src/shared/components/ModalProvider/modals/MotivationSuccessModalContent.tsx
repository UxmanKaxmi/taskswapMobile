import React from 'react';
import { StyleSheet, View } from 'react-native';

import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import PushButton from '@shared/components/PushButton';
import {
  platformShadow,
  spacing,
  type ThemeColors,
  useTheme,
  useThemedStyles,
} from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import type { MotivationSuccessModalPayload } from '../modalTypes';

const CLOSE_ANIMATION_DELAY_MS = 280;
const BUTTON_RADIUS = ms(24);

type Props = {
  payload: MotivationSuccessModalPayload;
  closeModal: () => void;
  markNextCloseAsCustom: () => void;
};

export default function MotivationSuccessModalContent({
  payload,
  closeModal,
  markNextCloseAsCustom,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const iconName = 'paper-plane';
  const outlineColor = colors.onboardingLine;
  const bubbleColor = colors.warmIconChipBg;
  const shadowColor = '#E6C84D';

  const runAfterClose = React.useCallback(
    (callback: () => void) => {
      markNextCloseAsCustom();
      closeModal();
      setTimeout(callback, CLOSE_ANIMATION_DELAY_MS);
    },
    [closeModal, markNextCloseAsCustom],
  );

  const handleViewRequest = () => {
    runAfterClose(payload.onViewRequest);
  };

  const handleInviteHelper = () => {
    runAfterClose(payload.onInviteHelper);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <View
          style={[
            styles.iconBubble,
            {
              backgroundColor: bubbleColor,
            },
            platformShadow({
              color: shadowColor,
              opacity: 0.08,
              radius: 10,
              offset: { width: 0, height: 6 },
            }),
          ]}
        >
          <Icon
            set="fa6"
            name={iconName}
            iconStyle="solid"
            size={36}
            color={colors.onboardingInk}
          />
        </View>
      </View>

      <TextElement variant="headline" weight="700" style={styles.title}>
        Your goal is live
      </TextElement>

      <TextElement variant="bodySmall" color="muted" style={styles.body}>
        People can now support you. We’ll notify you when someone shows up.
      </TextElement>

      <PushButton
        label="View Request"
        onPress={handleViewRequest}
        variant="push"
        size="lg"
        hideIcon
        style={StyleSheet.flatten([styles.actionButton, styles.primaryButton])}
        textStyle={styles.primaryButtonText}
      />

      <OutlineButton
        title="Invite someone you trust"
        onPress={handleInviteHelper}
        borderColor={outlineColor}
        textColor={colors.onboardingInk}
        style={StyleSheet.flatten([styles.actionButton, styles.secondary])}
        textStyle={{ color: colors.onboardingInk }}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingBottom: spacing.lg,
      alignItems: 'center',
    },

    iconWrap: {
      marginTop: vs(6),
      marginBottom: vs(20),
    },
    iconBubble: {
      width: ms(100),
      height: ms(100),
      borderRadius: ms(50),
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      textAlign: 'center',
      fontSize: ms(30),
      lineHeight: ms(34),
    },
    body: {
      textAlign: 'center',
      marginTop: vs(14),
      fontSize: ms(16),
      lineHeight: ms(24),
    },
    actionButton: {
      marginVertical: 0,
      marginHorizontal: 0,
      alignSelf: 'stretch',
      borderRadius: BUTTON_RADIUS,
    },
    primaryButton: {
      marginTop: vs(20),
    },
    primaryButtonText: {
      fontSize: ms(16),
      fontWeight: '800',
      color: colors.tactileMomentumSecondary,
    },
    secondary: {
      marginTop: vs(10),
    },
  });
