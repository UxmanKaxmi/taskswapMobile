// src/features/tasks/components/styles.ts
import { colors, spacing, typography } from '@shared/theme';
import { StyleSheet } from 'react-native';
import { moderateScale, moderateVerticalScale, ms, vs } from 'react-native-size-matters';

export const quoteSize = ms(38);
export const cardStyles = StyleSheet.create({
  mainText: {
    // marginBottom: vs(8),
    fontSize: ms(24),
    lineHeight: ms(30),
    fontWeight: '600',
  },
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
    // marginHorizontal: spacing.md,
    marginVertical: vs(8),

    borderRadius: spacing.md,
  },
  touchable: {
    paddingVertical: vs(15),
    paddingHorizontal: vs(20),
  },
  gradient: {
    flex: 1, // 🔑 THIS IS CRITICAL
    borderRadius: 16,
    overflow: 'hidden',
  },

  cardHeader: {
    marginBottom: vs(8),
  },

  avatar: {
    width: ms(35),
    height: ms(35),
    borderRadius: ms(35) / 2,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  name: {
    marginLeft: spacing.xs,
    fontSize: ms(14),
    fontWeight: '600',
    lineHeight: ms(18),
  },
  timeAgo: {
    marginLeft: spacing.xs,
    margin: 0,
    padding: 0,
    fontSize: ms(11),
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: vs(6),
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
  buttonRowDecision: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    width: '48%', // when wrapping inside flexWrap row
    // marginBottom: ;
  },
  buttonFull: {
    width: '100%',
  },
});
