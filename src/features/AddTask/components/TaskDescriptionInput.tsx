// src/features/tasks/components/TaskDescriptionInput.tsx

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import TextElement from '@shared/components/TextElement/TextElement';
import { TaskType, TaskTypeEnum } from '@features/Tasks/types/tasks';
import Row from '@shared/components/Layout/Row';
import { ms, s, vs } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import AppBorder from '@shared/components/AppBorder/AppBorder';
import { getTaskHints } from '../utils/taskCopy';
// import InspireMeButton from '@features/addTask/components/InspireMeButton';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder: string;
  error?: string;
  onPressInspire?: () => void;
  taskType: TaskType;
};

export default function TaskDescriptionInput({
  value,
  onChange,
  placeholder,
  error,
  onPressInspire,
  taskType,
}: Props) {
  const [charCount, setCharCount] = useState(0);

  return (
    <View>
      {/* TEXT INPUT */}
      <AppTextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        inputStyle={styles.input}
        containerStyle={styles.inputContainer}
        error={!!error}
        errorText={error}
        wrapperStyle={styles.wrapperStyle}
        charLimit={80}
        onCharCountChange={count => setCharCount(count)}
        numberOfLines={4}
      />
      <AppBorder />
      {/* FOOTER */}
      <View style={styles.footer}>
        <TextElement style={styles.footerText} color="muted">
          {getTaskHints(taskType)}
        </TextElement>

        <TextElement style={styles.charCount} color={charCount >= 80 ? 'error' : 'muted'}>
          {charCount}/80
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
    color: colors.muted,
  },
  footerText: {
    letterSpacing: 0.2,
    fontSize: ms(12),
    fontWeight: '500',
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
