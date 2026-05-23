// src/shared/components/Advice/AnimatedBottomComposer.tsx

import React, { useEffect, useRef } from 'react';
import { Animated, KeyboardAvoidingView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@shared/theme/useTheme';
import TextElement from '@shared/components/TextElement/TextElement';
import { vs, ms } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import { isAndroid } from '@shared/utils/constants';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import AppTextInput from '@shared/components/Inputs/AppTextInput';

const INPUT_HEIGHT = vs(48);
export const COMPOSER_HEIGHT = isAndroid ? vs(120) : vs(0);
const MIN_HEIGHT = vs(30);
const MAX_HEIGHT = vs(120);

const MIN_CHARS = 20;
const MAX_CHARS = 140;

type Props = {
  visible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
};

export default function AnimatedBottomComposer({
  visible,
  value,
  onChangeText,
  onSubmit,
  autoFocus,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const translateY = useRef(new Animated.Value(visible ? 0 : COMPOSER_HEIGHT)).current;

  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  const [inputHeight, setInputHeight] = React.useState(MIN_HEIGHT);

  const [showError, setShowError] = React.useState(false);

  const isTooShort = value.trim().length > 0 && value.trim().length < MIN_CHARS;
  const isTooLong = value.length > MAX_CHARS;
  const isValid = value.trim().length >= MIN_CHARS && value.length <= MAX_CHARS;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!value.trim()) {
      setInputHeight(MIN_HEIGHT);
    }
  }, [value]);

  useEffect(() => {
    if (visible && autoFocus) {
      inputRef.current?.focus();
    }
  }, [visible, autoFocus]);

  const handleSubmit = () => {
    if (!isValid) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onSubmit();
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: visible ? 0 : COMPOSER_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={isAndroid ? 'height' : 'padding'}
        style={styles.keyboardAvoiding}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* ✅ REAL INPUT */}
          <AppTextInput
            ref={inputRef}
            value={value}
            onChangeText={text => {
              onChangeText(text);
              if (showError) setShowError(false); // clear error once user edits
            }}
            placeholder="What helped you in a similar situation?"
            charLimit={MAX_CHARS}
            showCharCount={value.length > 0}
            multiline
            wrapperStyle={[styles.inputWrapper, { backgroundColor: colors.inputBackground }]}
            inputStyle={[styles.inputText, { height: inputHeight }]}
            error={showError && (isTooShort || isTooLong)}
            errorText={
              showError && isTooShort
                ? `Write at least ${MIN_CHARS} characters`
                : showError && isTooLong
                  ? `Keep it under ${MAX_CHARS} characters`
                  : undefined
            }
            onContentSizeChange={e => {
              const nextHeight = Math.min(
                MAX_HEIGHT,
                Math.max(MIN_HEIGHT, e.nativeEvent.contentSize.height),
              );
              setInputHeight(nextHeight);
            }}
          />
          {/* Footer */}
          <View style={styles.footerRow}>
            <TextElement style={styles.helperText} color="muted">
              Be kind & helpful
            </TextElement>

            <PrimaryButton
              title="Share advice →"
              onPress={handleSubmit}
              disabled={!value.trim()}
              style={[styles.cta, value.trim() && styles.backgroundDisabled]}
              textStyle={styles.ctaText}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderRadius: ms(18),
    borderWidth: 0, // 🔑 remove form look
  },

  inputText: {
    fontSize: ms(12),
    marginTop: vs(8),
    paddingHorizontal: ms(12),
  },
  backgroundDisabled: {
    backgroundColor: colors.adviceBgHardest,
  },

  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -10, // start hidden below screen
    alignItems: 'stretch',
  },
  keyboardAvoiding: {
    width: '100%',
  },

  sheet: {
    // width: '100%',
    paddingHorizontal: spacing.md,
    paddingTop: vs(20),
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,

    // iOS shadow
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },

    // Android
    elevation: 14,
  },

  input: {
    height: INPUT_HEIGHT,
    borderRadius: ms(18),
    paddingHorizontal: ms(16),
    fontSize: ms(14),
  },

  footerRow: {
    marginTop: vs(0),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  helperText: {
    fontSize: ms(12),
    marginLeft: ms(4),
    opacity: 0.85,
  },

  cta: {
    paddingHorizontal: ms(18),
    paddingVertical: vs(8),
    borderRadius: ms(999),
  },

  ctaText: {
    fontSize: ms(12),
  },
});
