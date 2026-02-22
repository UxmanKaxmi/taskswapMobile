import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';

import TextElement from '@shared/components/TextElement/TextElement';
import AppTextInput from '@shared/components/Inputs/AppTextInput';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { Height } from '@shared/components/Spacing';
import { colors, spacing } from '@shared/theme';
import { vs, ms } from 'react-native-size-matters';
import { Icon } from '@shared/components/Icons';
import type { ReminderMessageModalPayload } from '../modalTypes';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import { Tag } from '@shared/components/Tag';
import Row from '@shared/components/Layout/Row';

type Props = {
  payload: ReminderMessageModalPayload;
  closeModal: () => void;
};

type Tone = 'quick' | 'friendly' | 'direct';

const CHAR_LIMIT = 50;

export default function ReminderMessageModalContent({ payload, closeModal }: Props) {
  const [message, setMessage] = useState(payload.initialMessage ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tone, setTone] = useState<Tone>('friendly');

  useEffect(() => {
    setMessage(payload.initialMessage ?? '');
    setIsSubmitting(false);
    setTone('friendly');
  }, [payload]);

  const trimmed = message.trim();
  const chars = message.length;

  const isValid = useMemo(() => {
    // Allow empty note (because screenshot has “Skip note & send”)
    // but if user typed, it must be non-empty after trim.
    if (!message.length) return true;
    return !!trimmed;
  }, [message, trimmed]);

  const toneTemplates: Record<Tone, string> = {
    quick: 'Quick nudge 👋',
    friendly: "Don't forget!😊",
    direct: 'Reminder!',
  };

  const applyTone = (t: Tone) => {
    setTone(t);

    // Only auto-fill if user hasn’t started typing something meaningful
    // or if the current text equals one of our templates.
    const current = message.trim();
    const allTemplates = Object.values(toneTemplates).map(x => x.trim());

    if (!current || allTemplates.includes(current)) {
      setMessage(toneTemplates[t]);
    }
  };

  const handleSend = async (text: string) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(payload.onSend(text));
      closeModal();
    } catch {
      // Caller owns user-visible error handling.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrimarySend = async () => {
    // If user typed nothing, send the taskText as “no note” flow?
    // Screenshot suggests note is optional; we’ll send empty string if skipped.
    if (!isValid || isSubmitting) return;
    await handleSend(trimmed);
  };

  return (
    <View style={styles.container}>
      {/* Top icon */}
      <View style={styles.topIconWrap}>
        <View style={styles.topIconCircle}>
          <Icon set="ion" name="notifications" size={20} color={colors.reminderBgHardest} />
        </View>
      </View>

      <TextElement variant="subtitle" style={styles.title}>
        Send a Reminder
      </TextElement>
      <TextElement variant="caption" style={styles.name}>
        to {payload.taskName}
      </TextElement>

      {/* <Height size={vs(14)} /> */}

      {/* User row */}
      {/* <View style={styles.userRow}>
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <TextElement variant="body" style={styles.avatarInitial}>
                {(payload.taskName?.[0] ?? 'U').toUpperCase()}
              </TextElement>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.userText}>
          <TextElement variant="body" style={styles.userName}>
            {payload.taskName}
          </TextElement>
          <TextElement variant="caption" style={styles.userSub}>
            {subtitle}
          </TextElement>
        </View>
      </View> */}

      <Height size={vs(14)} />

      {/* Quoted card */}
      <View style={styles.quoteCard}>
        <TextElement variant="body" style={styles.quoteText}>
          “{payload.taskText}”
        </TextElement>
      </View>

      <Height size={vs(10)} />

      {/* Note header */}
      {/* <View style={styles.noteHeaderRow}></View> */}

      <Height size={vs(10)} />

      {/* Tone tags */}
      <View style={styles.tagsRow}>
        <Tag
          label="Quick nudge 👋"
          selected={tone === 'quick'}
          onPress={() => applyTone('quick')}
          selectOnly
          fillColor={tone === 'quick' ? colors.reminderBgHard : undefined}
          labelColor={tone === 'quick' ? 'reminderBgHardest' : undefined}
          borderColor={tone === 'quick' ? colors.reminderBgHardest : undefined}
        />
        <Tag
          label="Friendly 😊"
          selected={tone === 'friendly'}
          onPress={() => applyTone('friendly')}
          selectOnly
          fillColor={tone === 'friendly' ? colors.reminderBgHard : undefined}
          labelColor={tone === 'friendly' ? 'reminderBgHardest' : undefined}
          borderColor={tone === 'friendly' ? colors.reminderBgHardest : undefined}
        />
        <Tag
          label="Direct 🎯"
          selected={tone === 'direct'}
          onPress={() => applyTone('direct')}
          selectOnly
          fillColor={tone === 'direct' ? colors.reminderBgHard : undefined}
          labelColor={tone === 'direct' ? 'reminderBgHardest' : undefined}
          borderColor={tone === 'direct' ? colors.reminderBgHardest : undefined}
        />
      </View>

      <Height size={vs(16)} />

      {/* Note input */}
      {/* <View style={styles.inputWrap}> */}
      <AppTextInput
        containerStyle={{ gap: vs(5) }}
        label="Add a note"
        placeholder="Write a short note…"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={3}
        autoFocus
        useBottomSheetTextInput
        showCharCount={false} // we render our own count like screenshot
        charLimit={CHAR_LIMIT}
        onValidityChange={() => {
          // no-op; we validate locally to allow empty note
        }}
        wrapperStyle={styles.inputWrapper}
        inputStyle={styles.input}
      />
      <Row justify="flex-end" style={{ marginTop: -vs(7) }}>
        <TextElement
          variant="caption"
          style={[
            styles.charCount,
            { color: chars >= CHAR_LIMIT ? colors.error : colors.placeHolder },
          ]}
        >
          {chars}/{CHAR_LIMIT}
        </TextElement>
      </Row>
      {/* </View> */}

      <PrimaryButton
        style={{ backgroundColor: colors.reminderBgHardest, width: '100%', alignSelf: 'center' }}
        title="Send reminder"
        onPress={handlePrimarySend}
        disabled={!isValid || isSubmitting}
        isLoading={isSubmitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  topIconWrap: {
    alignItems: 'center',
    marginTop: vs(4),
  },
  topIconCircle: {
    width: vs(44),
    height: vs(44),
    borderRadius: vs(22),
    backgroundColor: colors.reminderIconBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginTop: vs(10),
    color: colors.text,
  },
  name: {
    textAlign: 'center',
    // fontWeight: '600',
    fontSize: ms(13),
    color: colors.muted,
  },

  quoteCard: {
    borderWidth: 1,
    borderColor: colors.reminderBgHard,
    backgroundColor: colors.reminderIconBackground,
    borderRadius: vs(14),
    paddingVertical: vs(18),
    paddingHorizontal: spacing.lg,
  },
  quoteText: {
    fontStyle: 'italic',
    color: colors.text,
    fontWeight: '600',
    lineHeight: vs(22),
  },

  noteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    color: colors.placeHolder,
    fontSize: ms(11),
    fontWeight: '700',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ms(10),
  },

  inputWrapper: {
    backgroundColor: colors.inputBackground,
    borderRadius: vs(12),
  },
  input: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: vs(70),
    textAlignVertical: 'top',
  },
});
