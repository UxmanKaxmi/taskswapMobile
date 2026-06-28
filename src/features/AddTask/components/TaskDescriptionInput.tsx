// src/features/tasks/components/TaskDescriptionInput.tsx

import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import TextElement from '@shared/components/TextElement/TextElement';
import { TaskType } from '@features/Tasks/types/tasks';
import { ms, vs } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { getTaskHints } from '../utils/taskCopy';
// import InspireMeButton from '@features/addTask/components/InspireMeButton';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  error?: string;
  taskType: TaskType;
  charLimit?: number;
  minLength?: number;
  footerText?: string;
  footerTextColor?: keyof typeof colors;
  dividerColor?: string;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export default function TaskDescriptionInput({
  value,
  onChange,
  placeholder,
  error,
  taskType,
  charLimit = 80,
  minLength,
  footerText,
  footerTextColor = 'muted',
  dividerColor = colors.border,
  inputWrapperStyle,
  inputStyle,
}: Props) {
  const [charCount, setCharCount] = useState(0);
  const resolvedFooterText = footerText ?? getTaskHints(taskType);
  // Red when at/over the max, or once typing has started but is still under the min.
  const belowMin = minLength != null && charCount > 0 && charCount < minLength;
  const countIsError = charCount >= charLimit || belowMin;

  useEffect(() => {
    setCharCount(value.length);
  }, [value]);

  return (
    <View>
      {/* TEXT INPUT */}
      <AppTextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        inputStyle={[styles.input, inputStyle]}
        containerStyle={styles.inputContainer}
        error={!!error}
        wrapperStyle={[styles.wrapperStyle, inputWrapperStyle]}
        charLimit={charLimit}
        onCharCountChange={count => setCharCount(count)}
        numberOfLines={4}
      />
      <AppBorder color={dividerColor} />
      {/* FOOTER — shows the error in place of the hint when present */}
      <View style={styles.footer}>
        <TextElement
          style={styles.footerText}
          color={error ? 'error' : footerTextColor}
        >
          {error ?? resolvedFooterText}
        </TextElement>

        <TextElement
          style={styles.charCount}
          color={countIsError ? 'error' : footerTextColor}
        >
          {charCount}/{charLimit}
        </TextElement>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  charCount: {
    letterSpacing: 0.2,
    fontSize: ms(12),
    alignSelf: 'flex-end',
    flexShrink: 0,
    marginLeft: spacing.sm,
  },
  footerText: {
    letterSpacing: 0.2,
    fontSize: ms(12),
    fontWeight: '500',
    flex: 1,
  },
  wrapperStyle: {
    borderWidth: 0,
  },
  // backgroundColor: colors.background,
  // borderRadius: 16,
  // padding: spacing.md,
  // // subtle elevation
  // shadowColor: '#000',
  // shadowOffset: { width: 0, height: 6 },
  // shadowOpacity: 0.06,
  // shadowRadius: 12,
  // elevation: 4,

  inputContainer: {
    width: '100%',
    marginBottom: spacing.md,
  },

  input: {
    minHeight: vs(50),
    textAlignVertical: 'top',
    fontSize: ms(15),
    lineHeight: ms(20),
    paddingTop: 0, // important: keeps text aligned like design
    borderWidth: 0,
  },

  footer: {
    borderTopColor: colors.border,
    paddingTop: spacing.sm,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
