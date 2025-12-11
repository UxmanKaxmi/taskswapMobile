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
    case 'motivation':
      return 'Push someone up! Drop your motivation.';
    case 'reminder':
      return 'What do you need to remember?';
    case 'decision':
      return 'What are you deciding between?';
    case 'advice':
      return 'What do you want advice on?';
    default:
      return 'Write your push...';
  }
}

const getTitle = (type: TaskType) => {
  switch (type) {
    case 'motivation':
      return 'Your Push';
    case 'reminder':
      return 'Reminder Details';
    case 'decision':
      return 'Decision Details';
    case 'advice':
      return 'Advice Request';
    default:
      return 'Your Push';
  }
};

export default function TaskDescriptionInput({ type, value, error, onChange }: Props) {
  return (
    <>
      <TextElement
        weight="600"
        variant="subtitle"
        style={[
          styles.label,
          {
            // color: error ? colors.error : colors.text,
          },
        ]}
      >
        {getTitle(type)}
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
