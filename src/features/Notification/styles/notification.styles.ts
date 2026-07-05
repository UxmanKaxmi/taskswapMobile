// src/features/tasks/components/styles.ts
import { colors, spacing } from '@shared/theme';
import { StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

export const notificationStyles = StyleSheet.create({
  timeAgoText: {
    fontSize: ms(9),
    lineHeight: ms(12),
    marginTop: vs(2),
  },
  nameText: {
    fontSize: ms(13),
    lineHeight: ms(17),
  },
  notifyText: {
    fontSize: ms(13),
    lineHeight: ms(17),
    paddingEnd: ms(7),
  },
  typeText: {
    fontSize: ms(13),
    lineHeight: ms(17),
  },
  bodyText: {
    fontSize: ms(14),
    lineHeight: ms(20),
  },
  bodyMetaText: {
    fontSize: ms(12),
    lineHeight: ms(16),
  },
  emojiText: {
    fontSize: ms(22),
    lineHeight: ms(28),
  },
  unreadCard: {
    backgroundColor: colors.adviceBg,
    // Clear unread marker: a colored left accent bar. Read rows carry a
    // transparent border of the same width so there's no horizontal shift.
    borderLeftWidth: ms(4),
    borderLeftColor: colors.adviceBgHardest,
  },
  readCard: {
    backgroundColor: colors.onAccent,
    borderLeftWidth: ms(4),
    borderLeftColor: 'transparent',
  },
  cardStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
