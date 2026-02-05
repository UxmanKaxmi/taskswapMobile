// src/features/tasks/components/styles.ts
import { colors, spacing } from '@shared/theme';
import { StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

export const notificationStyles = StyleSheet.create({
  timeAgoText: {
    fontSize: ms(11),
    marginTop: vs(2),
  },
  nameText: {
    fontSize: ms(15),
  },
  notifyText: {
    fontSize: ms(15),
    paddingEnd: ms(7),
  },
  unreadCard: {
    backgroundColor: colors.adviceBg,
  },
  readCard: {
    backgroundColor: colors.onAccent,
  },
  cardStyles: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
