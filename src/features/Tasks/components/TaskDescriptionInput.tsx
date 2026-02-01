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
  // type: TaskType;
  value: string;
  onChange: (text: string) => void;
  error?: string; // ✅ new prop for error
  placeholder: string; // NEW PROP
  title: string; // NEW PROP
};

export default function TaskDescriptionInput({
  type,
  value,
  error,
  onChange,
  placeholder,
  title,
}: Props) {
  return (
    <>
      {/* <TextElement
        weight="600"
        variant="subtitle"
        style={[
          styles.label,
          {
            // color: error ? colors.error : colors.text,
          },
        ]}
      >
        {title}
      </TextElement> */}
      <Row>
        <AppTextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
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
