// src/shared/components/Inputs/AppTextInput.tsx

import React, { useRef, useEffect } from 'react';
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { colors, spacing, typography } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';

interface AppTextInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  showCharCount?: boolean;
  charLimit?: number;
  onChangeText: (text: string) => void;
  value: string;
  onValidityChange?: (isValid: boolean) => void;
  autoFocus?: boolean;
}

export default function AppTextInput({
  label,
  containerStyle,
  inputStyle,
  showCharCount = false,
  charLimit = 90,
  value,
  onChangeText,
  onValidityChange,
  autoFocus = false,
  ...rest
}: AppTextInputProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const labelPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (onValidityChange) {
      const isValid = !!value.trim() && value.length <= charLimit;
      onValidityChange(isValid);
    }

    if (value.length >= charLimit) {
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
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 6,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -6,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
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
  }, [value.length, value, charLimit, onValidityChange]);

  return (
    <View style={containerStyle}>
      {label && (
        <Animated.View>
          <TextElement variant="caption" style={styles.label}>
            {label}
          </TextElement>
        </Animated.View>
      )}
      <Animated.View style={[styles.wrapper, { transform: [{ translateX: shakeAnim }] }]}>
        <TextInput
          autoFocus={autoFocus}
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={text => {
            if (text.length <= charLimit) {
              onChangeText(text);
            }
          }}
          maxLength={charLimit}
          {...rest}
        />
      </Animated.View>
      {showCharCount && (
        <Animated.Text
          style={[
            styles.charCount,
            value.length >= charLimit && { color: colors.error },
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {value.length}/{charLimit}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  input: {
    padding: spacing.sm,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
    height: 60,
    textAlignVertical: 'top',
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
