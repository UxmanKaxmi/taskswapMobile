import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { Height } from '@shared/components/Spacing';
import Avatar from '@shared/components/Avatar/Avatar';
import { timeAgo } from '@shared/utils/helperFunctions';

type AdviceItem = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    name: string;
    photo?: string;
  };
};

type Props = {
  advice: AdviceItem[];
};

export default function SupportiveAdviceSection({ advice }: Props) {
  if (!advice || advice.length === 0) return null;

  return (
    <View>
      {/* Section header */}
      <TextElement variant="sectionTitle" color={colors.textSecondary} style={styles.sectionTitle}>
        SUPPORTIVE ADVICE
      </TextElement>

      <Height size={12} />

      {/* Advice cards */}
      {advice.map(item => (
        <View key={item.id} style={styles.card}>
          <Avatar uri={item.user.photo} size={36} />

          <View style={styles.content}>
            <TextElement variant="bodyMedium">{item.user.name}</TextElement>

            <TextElement variant="caption" color={colors.textSecondary} style={styles.time}>
              {timeAgo(item.createdAt)}
            </TextElement>

            <TextElement style={styles.text}>{item.text}</TextElement>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    letterSpacing: 1,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: spacing.sm,

    // subtle depth (safe for iOS + Android)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  time: {
    marginTop: 2,
  },
  text: {
    marginTop: spacing.sm,
    lineHeight: 22,
  },
});
