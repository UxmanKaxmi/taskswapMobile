import React from 'react';
import { StyleSheet, View } from 'react-native';

import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { spacing } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import {
  getTypeColor,
  typeBackgrounds,
  typeBackgroundsHard,
  typeIcons,
} from '@shared/utils/typeVisuals';
import type { MotivationSuccessModalPayload } from '../modalTypes';

const CLOSE_ANIMATION_DELAY_MS = 280;

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
  const iconName = typeIcons[payload.type];
  const typeColor = getTypeColor(payload.type);
  const bubbleColor = typeBackgrounds[payload.type];
  const shadowColor = typeBackgroundsHard[payload.type];

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
              shadowColor: shadowColor,
            },
          ]}
        >
          <Icon set="fa6" name={iconName} iconStyle="solid" size={35} color={typeColor} />
        </View>
      </View>

      <TextElement variant="headline" weight="700" style={styles.title}>
        Your request is live
      </TextElement>

      <TextElement variant="bodySmall" color="muted" style={styles.body}>
        People can now support you. We’ll notify you when someone shows up.
      </TextElement>

      <PrimaryButton
        title="View Request"
        onPress={handleViewRequest}
        backgroundColor={typeColor}
        style={StyleSheet.flatten([styles.actionButton, styles.primaryButton])}
      />

      <OutlineButton
        title="Invite someone you trust"
        onPress={handleInviteHelper}
        style={StyleSheet.flatten([
          styles.actionButton,
          styles.secondary,
          { borderColor: typeColor },
        ])}
        textStyle={{ color: typeColor }}
      />

      <TextElement variant="label" color="muted" style={styles.helperText}>
        Bring someone in to support you right away.
      </TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },

  iconWrap: {
    marginTop: vs(8),
    marginBottom: vs(18),
  },
  iconBubble: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  title: {
    textAlign: 'center',
    fontSize: ms(31),
    lineHeight: ms(36),
  },
  body: {
    textAlign: 'center',
    marginTop: vs(12),
  },
  actionButton: {
    marginVertical: 0,
    marginHorizontal: 0,
    alignSelf: 'stretch',
    borderRadius: 18,
  },
  primaryButton: {
    marginTop: vs(20),
  },
  secondary: {
    marginTop: vs(7),
  },
  helperText: {
    textAlign: 'center',
    marginTop: vs(10),
    paddingHorizontal: spacing.md,
  },
});
