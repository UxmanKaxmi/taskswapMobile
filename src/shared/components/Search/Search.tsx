// src/shared/components/Search.tsx

import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { ThemeColors, spacing, useTheme, useThemedStyles } from '@shared/theme';
import { resolveAppTextStyle } from '@shared/theme/fonts';
import Icon from '../Icons/Icon';
import { ms, vs } from 'react-native-size-matters';

interface SearchProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function Search({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  ...rest
}: SearchProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const resolvedInputStyle = resolveAppTextStyle(styles.input, { variant: 'body' });

  return (
    <View style={styles.container}>
      <Icon set="ion" name={'search'} color={colors.muted} size={ms(16)} />
      <TextInput
        style={resolvedInputStyle}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      {!!value && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Icon set="ion" name="close-circle" size={20} color={colors.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.onboardingLine,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      minHeight: vs(35),
      // paddingVertical: vs(10),
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    input: {
      flex: 1,
      fontSize: ms(15),
      color: colors.onboardingInk,
      marginLeft: spacing.sm,
    },
    clearButton: {
      marginLeft: spacing.xs,
    },
  });
