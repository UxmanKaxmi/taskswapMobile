// src/shared/components/Search.tsx

import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@shared/theme';
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
  const resolvedInputStyle = resolveAppTextStyle(styles.input, { variant: 'body' });

  return (
    <View style={styles.container}>
      <Icon set="ion" name={'search'} color={colors.muted} size={ms(15)} />
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.adviceBg,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: vs(40),
    // paddingVertical: vs(10),
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
  },
  clearButton: {
    marginLeft: spacing.xs,
  },
});
