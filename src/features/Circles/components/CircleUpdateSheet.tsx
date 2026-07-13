import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ms, vs } from 'react-native-size-matters';
import AppModal from '@shared/components/AppModal/AppModal';
import TextElement from '@shared/components/TextElement/TextElement';
import Icon from '@shared/components/Icons/Icon';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';

const QUICK_FILLS = ['Showed up again today.', 'Rough one, but I did it.', 'Halfway. Feeling it.'];

const UPDATE_MAX_LENGTH = 120;

type Props = {
  visible: boolean;
  onClose: () => void;
  onPost: (text: string) => void;
  isPosting: boolean;
};

// "Share an update" — a short post to the circle from your own lane.
// Rides the existing progress-update machinery (server cooldown included).
export default function CircleUpdateSheet({ visible, onClose, onPost, isPosting }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [text, setText] = useState('');

  const canPost = text.trim().length > 0 && !isPosting;

  const handlePost = () => {
    if (!canPost) return;
    onPost(text.trim());
    setText('');
  };

  return (
    <AppModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.dim} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
        pointerEvents="box-none"
      >
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.iconCircle}>
            <Icon set="ion" name="pencil" size={ms(18)} color={colors.tactileMomentumSecondary} />
          </View>
          <TextElement variant="title" weight="800" style={styles.title}>
            Share an update
          </TextElement>
          <TextElement variant="bodySmall" color="muted" style={styles.subtitle}>
            Your circle sees it and can cheer. No pressure to be polished.
          </TextElement>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Day 5. Made it out the door before work..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={UPDATE_MAX_LENGTH}
            autoFocus
          />

          <View style={styles.chipsRow}>
            {QUICK_FILLS.map(fill => (
              <Pressable key={fill} style={styles.quickChip} onPress={() => setText(fill)}>
                <TextElement variant="caption" weight="600" style={styles.quickChipText}>
                  {fill}
                </TextElement>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.postButton, !canPost && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!canPost}
            accessibilityRole="button"
            accessibilityLabel="Post the update to your circle"
          >
            <TextElement variant="subtitle" weight="700" style={styles.postButtonText}>
              {isPosting ? 'Posting...' : 'Post to the circle'}
            </TextElement>
          </Pressable>

          <TextElement variant="caption" color="muted" style={styles.finePrint}>
            It shows in your lane and everyone's activity.
          </TextElement>
        </View>
      </KeyboardAvoidingView>
    </AppModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    dim: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheetWrap: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingHorizontal: spacing.md,
      paddingTop: vs(10),
      paddingBottom: vs(28),
    },
    grabber: {
      width: ms(38),
      height: vs(4),
      borderRadius: 999,
      backgroundColor: colors.onboardingLine,
      alignSelf: 'center',
      marginBottom: vs(14),
    },
    iconCircle: {
      width: ms(44),
      height: ms(44),
      borderRadius: ms(22),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: vs(8),
    },
    title: {
      textAlign: 'center',
      color: colors.text,
      fontSize: ms(18),
    },
    subtitle: {
      textAlign: 'center',
      marginTop: vs(4),
      marginBottom: vs(14),
    },
    input: {
      backgroundColor: colors.onboardingPaper,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      borderRadius: 16,
      padding: spacing.sm,
      minHeight: vs(80),
      fontSize: ms(15),
      lineHeight: ms(21),
      color: colors.text,
      textAlignVertical: 'top',
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: ms(8),
      marginTop: vs(12),
      marginBottom: vs(14),
    },
    quickChip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.onboardingPaper,
      borderRadius: 999,
      paddingVertical: vs(6),
      paddingHorizontal: ms(12),
    },
    quickChipText: {
      color: colors.text,
    },
    postButton: {
      backgroundColor: colors.onboardingPush,
      borderRadius: 999,
      paddingVertical: vs(13),
      alignItems: 'center',
    },
    postButtonDisabled: {
      opacity: 0.5,
    },
    postButtonText: {
      color: colors.tactileMomentumSecondary,
      fontSize: ms(15),
    },
    finePrint: {
      textAlign: 'center',
      marginTop: vs(10),
    },
  });
