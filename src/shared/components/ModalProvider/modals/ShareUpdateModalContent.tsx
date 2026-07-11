import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import Icon from '@shared/components/Icons/Icon';
import {
  platformShadow,
  spacing,
  type ThemeColors,
  useTheme,
  useThemedStyles,
} from '@shared/theme';
import { typeIcons, useTypeVisuals } from '@shared/utils/typeVisuals';
import {
  PROGRESS_UPDATE_COOLDOWN_LABEL,
  SHARE_UPDATE_CHARACTER_LIMIT,
  SHARE_UPDATE_MIN_CHARACTER_LIMIT,
} from '@shared/utils/constants';
import { ms, vs } from 'react-native-size-matters';
import type { ShareUpdateModalPayload } from '../modalTypes';

type Props = {
  payload: ShareUpdateModalPayload;
  closeModal: () => void;
};

export default function ShareUpdateModalContent({ payload, closeModal }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { typeBackgroundsHard } = useTypeVisuals();
  const [message, setMessage] = useState(payload.initialMessage ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMessage(payload.initialMessage ?? '');
    setIsSubmitting(false);
  }, [payload]);

  const trimmed = message.trim();
  const belowMin = trimmed.length > 0 && trimmed.length < SHARE_UPDATE_MIN_CHARACTER_LIMIT;
  const isValid = useMemo(
    () =>
      trimmed.length >= SHARE_UPDATE_MIN_CHARACTER_LIMIT &&
      message.length <= SHARE_UPDATE_CHARACTER_LIMIT,
    [trimmed, message],
  );
  const iconName = typeIcons[payload.type];
  const shadowColor = typeBackgroundsHard[payload.type];

  const handleShare = async () => {
    if (!isValid || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(payload.onShare(trimmed));
      closeModal();
    } catch {
      // Caller owns user-visible error handling.
    } finally {
      setIsSubmitting(false);
    }
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
              opacity: 0.22,
              radius: 12,
              offset: { width: 0, height: 6 },
            }),
          ]}
        >
          <Icon
            set="fa6"
            name={iconName}
            iconStyle="solid"
            size={ms(35)}
            color={colors.tactileMomentumSecondary}
          />
        </View>
      </View>

      <TextElement variant="headline" weight="700" style={styles.title}>
        Share update
      </TextElement>

      <TextElement variant="bodySmall" color="muted" style={styles.body}>
        Let your supporters know how it’s going. Updates are limited to once every{' '}
        {PROGRESS_UPDATE_COOLDOWN_LABEL}.
      </TextElement>

      <Height size={vs(18)} />

      <AppTextInput
        label="Update"
        placeholder="Example: I started working on it. Thanks for the push."
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={3}
        useBottomSheetTextInput
        showCharCount={false}
        charLimit={SHARE_UPDATE_CHARACTER_LIMIT}
        wrapperStyle={styles.inputWrapper}
        inputStyle={styles.input}
        containerStyle={{ width: '100%' }}
      />

      <Row justify="space-between" align="center" style={styles.countRow}>
        <TextElement
          variant="tiny"
          style={[styles.hint, { color: belowMin ? colors.error : colors.placeHolder }]}
        >
          {belowMin ? `Write at least ${SHARE_UPDATE_MIN_CHARACTER_LIMIT} characters` : ''}
        </TextElement>
        <TextElement
          variant="tiny"
          style={[
            styles.charCount,
            {
              color:
                message.length >= SHARE_UPDATE_CHARACTER_LIMIT || belowMin
                  ? colors.error
                  : colors.placeHolder,
            },
          ]}
        >
          {message.length}/{SHARE_UPDATE_CHARACTER_LIMIT}
        </TextElement>
      </Row>

      <PrimaryButton
        title="Share update"
        onPress={handleShare}
        disabled={!isValid || isSubmitting}
        isLoading={isSubmitting}
        style={{
          ...styles.button,
          backgroundColor:
            !isValid || isSubmitting ? colors.disabled : colors.tactileMomentumPrimary,
        }}
        textStyle={[{ opacity: !isValid || isSubmitting ? 0.4 : 1 }, styles.primaryText]}
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
      marginTop: vs(8),
      marginBottom: vs(15),
    },
    iconBubble: {
      width: ms(80),
      height: ms(80),
      borderRadius: ms(40),
      alignItems: 'center',
      justifyContent: 'center',
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
    inputWrapper: {
      backgroundColor: colors.inputBackground,
      borderRadius: vs(12),
    },
    input: {
      color: colors.text,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      minHeight: vs(80),
      textAlignVertical: 'top',
    },
    countRow: {
      alignSelf: 'stretch',
      marginTop: vs(5),
    },
    hint: {
      flexShrink: 1,
      fontSize: ms(11),
    },
    charCount: {
      flexShrink: 0,
      fontSize: ms(11),
    },
    button: {
      width: '100%',
      alignSelf: 'stretch',
      marginHorizontal: 0,
      borderRadius: 18,
    },
    primaryText: {
      color: colors.tactileMomentumSecondary,
    },
  });
