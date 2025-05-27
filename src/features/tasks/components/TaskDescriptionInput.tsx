// src/features/tasks/components/TaskDescriptionInput.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import TextElement from '@shared/components/TextElement/TextElement';
import { TaskType } from '@features/Tasks/types/tasks';
import Row from '@shared/components/Layout/Row';
import { ms, vs } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';

type Props = {
  type: TaskType;
  value: string;
  onChange: (text: string) => void;
  error?: string; // ✅ new prop for error
};

function getTaskPlaceholder(type: TaskType): string {
  switch (type) {
    case 'reminder':
      return 'What do you need to be reminded about?';
    case 'decision':
      return 'What decision do you need help making?';
    case 'motivation':
      return 'What do you need motivation for?';
    case 'advice':
      return 'What would you like advice on?';
    default:
      return 'What do you need help with?';
  }
}

export default function TaskDescriptionInput({ type, value, error, onChange }: Props) {
  return (
    <>
      <TextElement
        weight="600"
        variant="title"
        style={[
          styles.label,
          {
            // color: error ? colors.error : colors.text,
          },
        ]}
      >
        Task Description
      </TextElement>
      <Row>
        <AppTextInput
          value={value}
          onChangeText={onChange}
          placeholder={getTaskPlaceholder(type)}
          showCharCount
          charLimit={80}
          multiline
          inputStyle={{
            height: 120,
            textAlignVertical: 'top',
            marginBottom: 0,
            fontSize: ms(14),
          }}
          containerStyle={styles.inputContainer}
          error={!!error}
          errorText={error}
        />
      </Row>
      {/* {error && (
        <TextElement variant="caption" color="error" style={styles.errorText}>
          {error}
        </TextElement>
      )} */}
    </>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
  },
  label: {
    marginBottom: vs(5),
    marginTop: vs(5),
  },
  inputContainer: {
    width: '100%',
  },
});
