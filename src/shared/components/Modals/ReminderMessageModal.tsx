// src/shared/components/Modals/ReminderMessageModal.tsx

import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { colors, spacing, typography } from '@shared/theme';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '../Spacing';
import AppTextInput from '../Inputs/AppTextInput';

interface ReminderMessageModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  message: string;
  setMessage: (val: string) => void;
  taskName: string;
  taskText: string;
  isLoading?: boolean;
}

//#TODO: Add pre generated message bubbles

export default function ReminderMessageModal({
  visible,
  onClose,
  onSend,
  message,
  setMessage,
  taskName,
  taskText,
  isLoading,
}: ReminderMessageModalProps) {
  const [isValid, setIsValid] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // tweak if needed
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.modalBox}>
          <TextElement variant="body" style={styles.subheader}>
            {taskName} wanted a reminder about:
          </TextElement>
          <TextElement variant="body" style={styles.quotedText}>
            “{taskText}”
          </TextElement>
          <Height size={20} />
          {/* <TextElement variant="caption" style={styles.instruction}>
            
          </TextElement> */}
          <AppTextInput
            label="Share a customized message for them:"
            placeholder=""
            value={message || ''}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            autoFocus
            showCharCount
            charLimit={65}
            onValidityChange={setIsValid}
          />

          <PrimaryButton
            title="Send Reminder"
            onPress={() => onSend(message)}
            disabled={!isValid}
            isLoading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    width: '90%', // ✅ takes 90% of screen width
    maxWidth: 400, // ✅ never exceeds this (looks clean on tablets)
    alignSelf: 'center',
  },
  subheader: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  quotedText: {
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    color: colors.primary,
  },

  charCount: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    color: colors.muted,
  },
});
