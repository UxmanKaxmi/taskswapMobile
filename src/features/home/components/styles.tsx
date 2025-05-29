// src/features/tasks/components/styles.ts
import { colors, spacing, typography } from '@shared/theme';
import { StyleSheet } from 'react-native';
import { moderateScale, moderateVerticalScale, ms, vs } from 'react-native-size-matters';

export const cardStyles = StyleSheet.create({
  type: {
    fontSize: ms(12),
    fontWeight: '500',
    backgroundColor: colors.border,
    paddingVertical: ms(4),
    paddingHorizontal: ms(12),
    borderRadius: 20,
    color: colors.text,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginVertical: vs(8),
    padding: spacing.md,
    borderRadius: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  cardHeader: {
    marginBottom: vs(8),
  },

  avatar: {
    width: ms(50),
    height: ms(50),
    borderRadius: ms(50) / 2,
  },

  name: {
    marginLeft: spacing.xs,
  },
  timeAgo: {
    marginLeft: spacing.xs,
    margin: 0,
    padding: 0,
    fontSize: ms(12),
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(0),
  },

  emoji: {
    marginLeft: spacing.sm,
  },

  actions: {
    justifyContent: 'space-between',
  },

  button: {
    flex: 1,
    marginRight: spacing.sm,
    borderRadius: spacing.xs,
    paddingVertical: spacing.sm,
  },

  buttonText: {
    fontSize: typography.small,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: ;
  },
  buttonFull: {
    width: '100%',
  },
});
