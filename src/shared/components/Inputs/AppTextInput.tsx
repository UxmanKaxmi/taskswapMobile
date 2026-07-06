// src/shared/components/Inputs/AppTextInput.tsx

import React, { useRef, useEffect, forwardRef } from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  Animated,
  StyleProp,
} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ThemeColors, spacing, typography, useTheme, useThemedStyles } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import { resolveAppTextStyle } from '@shared/theme/fonts';
import Row from '../Layout/Row';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  showCharCount?: boolean;
  charLimit?: number;
  onChangeText: (text: string) => void;
  value: string;
  onValidityChange?: (isValid: boolean) => void;
  autoFocus?: boolean;
  error?: boolean;
  errorText?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
  onCharCountChange?: (count: number, limit: number) => void;
  useBottomSheetTextInput?: boolean;
}

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  (
    {
      label,
      containerStyle,
      wrapperStyle,
      inputStyle,
      showCharCount = false,
      charLimit = 90,
      value,
      onChangeText,
      onValidityChange,
      autoFocus = false,
      error,
      errorText,
      onCharCountChange,
      useBottomSheetTextInput = false,
      ...rest
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const styles = useThemedStyles(createStyles);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const labelPulse = useRef(new Animated.Value(1)).current;
    const prevErrorRef = useRef<boolean | undefined>(false);

    useEffect(() => {
      const exceededLimit = value.length >= charLimit;
      const errorBecameTrue = !prevErrorRef.current && error;

      if (onValidityChange) {
        const isValid = !!value.trim() && value.length <= charLimit;
        onValidityChange(isValid);
      }

      if (errorBecameTrue || exceededLimit) {
        Animated.parallel([
          Animated.sequence([
            Animated.spring(scaleAnim, {
              toValue: 1.15,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(labelPulse, {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(labelPulse, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }

      prevErrorRef.current = error;
    }, [value, charLimit, error, onValidityChange]);

    const InputComponent: any = useBottomSheetTextInput ? BottomSheetTextInput : TextInput;
    const resolvedInputStyle = resolveAppTextStyle([styles.input, inputStyle], { variant: 'body' });
    const resolvedErrorStyle = resolveAppTextStyle(
      [styles.charCount, error && { color: colors.error }, { transform: [{ scale: scaleAnim }] }],
      { variant: 'label' },
    );
    const resolvedCharCountStyle = resolveAppTextStyle(
      [
        styles.charCount,
        value.length >= charLimit && { color: colors.error },
        { transform: [{ scale: scaleAnim }] },
      ],
      { variant: 'label' },
    );

    return (
      <View style={containerStyle}>
        {label && (
          <Animated.View>
            <TextElement variant="caption" style={styles.label}>
              {label}
            </TextElement>
          </Animated.View>
        )}

        <Animated.View
          style={[
            styles.wrapper,
            {
              transform: [{ translateX: shakeAnim }],
              borderColor: value.length >= charLimit || error ? colors.error : colors.border,
            },
            wrapperStyle,
          ]}
        >
          <InputComponent
            ref={ref} // ✅ THIS IS THE KEY
            autoFocus={autoFocus}
            style={resolvedInputStyle}
            placeholderTextColor={colors.placeHolder}
            value={value}
            multiline
            textAlignVertical="top"
            onChangeText={text => {
              const lines = text.split('\n');
              if (lines.length > 4) return;

              if (text.length <= charLimit) {
                onChangeText(text);
                onCharCountChange?.(text.length, charLimit);
              }
            }}
            maxLength={charLimit}
            {...rest}
          />
        </Animated.View>

        <Row style={{ justifyContent: errorText ? 'space-between' : 'flex-end' }}>
          {errorText && <Animated.Text style={resolvedErrorStyle}>{errorText}</Animated.Text>}

          {showCharCount && (
            <Animated.Text style={resolvedCharCountStyle}>
              {value.length}/{charLimit}
            </Animated.Text>
          )}
        </Row>
      </View>
    );
  },
);

export default AppTextInput;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: spacing.xs,
    },
    input: {
      paddingHorizontal: spacing.sm,
      fontSize: typography.caption,
      marginBottom: spacing.xs,
      // height: 60,
      lineHeight: 20,
      textAlignVertical: 'center',
    },
    charCount: {
      alignSelf: 'flex-end',
      marginTop: 2,
      marginBottom: spacing.md,
      color: colors.muted,
    },
    label: {
      marginBottom: spacing.xs,
      fontWeight: '600',
      color: colors.text,
    },
  });
