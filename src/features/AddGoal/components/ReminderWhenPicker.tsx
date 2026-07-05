import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { colors, spacing } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import Icon from '@shared/components/Icons/Icon';
import DatePicker from 'react-native-date-picker';
import { format, isToday, isTomorrow } from 'date-fns';
import { Shadow } from '@shared/components/Shadow';

type Props = {
  date: Date;
  time: Date;
  minDate?: Date;

  onDateChange?: (date: Date) => void;
  onTimeChange?: (time: Date) => void;

  /** If true, UI is shown but cannot be interacted with */
  readOnly?: boolean;
  removeHeading?: boolean;
  removeBottomDescription?: boolean;
};

export default function ReminderWhenPicker({
  date,
  time,
  minDate,
  onDateChange,
  onTimeChange,
  readOnly = false,
  removeHeading = false,
  removeBottomDescription = false,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const dateLabel = isToday(date)
    ? 'Today'
    : isTomorrow(date)
      ? 'Tomorrow'
      : format(date, 'EEE, MMM d');

  const timeLabel = format(time, 'p');

  // Only relevant when pickers are enabled
  const safeMinDate = minDate ?? new Date();
  const minTime = isSameDay(date, safeMinDate)
    ? safeMinDate
    : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  const DateCard = (
    <View>
      <TextElement style={styles.label}>Date</TextElement>
      <TextElement style={styles.value}>{dateLabel}</TextElement>
    </View>
  );

  const TimeCard = (
    <View>
      <TextElement style={styles.label}>Time</TextElement>
      <TextElement style={styles.value}>{timeLabel}</TextElement>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {!removeHeading && (
        <View style={styles.header}>
          <Icon set="ion" name={'time'} size={ms(16)} color={colors.reminderBgHardest} />
          <TextElement color={'reminderBgHardest'} style={styles.headerText} weight="600">
            When?
          </TextElement>
        </View>
      )}

      <Row gap={spacing.sm}>
        {/* DATE */}
        <Shadow size="tint" style={styles.card}>
          {readOnly ? (
            DateCard
          ) : (
            <Pressable onPress={() => setShowDatePicker(true)}>{DateCard}</Pressable>
          )}
        </Shadow>

        {/* TIME */}
        <Shadow size="tint" style={styles.card}>
          {readOnly ? (
            TimeCard
          ) : (
            <Pressable onPress={() => setShowTimePicker(true)}>{TimeCard}</Pressable>
          )}
        </Shadow>
      </Row>

      {/* Only render pickers when not read-only */}
      {!readOnly && (
        <>
          <DatePicker
            modal
            open={showDatePicker}
            date={date}
            mode="date"
            minimumDate={safeMinDate}
            onConfirm={selected => {
              setShowDatePicker(false);
              onDateChange?.(selected);
            }}
            onCancel={() => setShowDatePicker(false)}
          />

          <DatePicker
            modal
            open={showTimePicker}
            date={time}
            minimumDate={minTime}
            mode="time"
            onConfirm={selected => {
              setShowTimePicker(false);
              onTimeChange?.(selected);
            }}
            onCancel={() => setShowTimePicker(false)}
          />
        </>
      )}

      {!removeBottomDescription && (
        <TextElement color={'reminderBgHardest'} style={styles.noteText}>
          Just a heads-up — reminders need to be at least 2 hours from now
        </TextElement>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerText: {
    marginLeft: spacing.sm,
    fontSize: ms(16),
    fontWeight: '600',
  },
  noteText: {
    fontStyle: 'italic',
    marginTop: vs(8),
    fontSize: ms(12),
    fontWeight: '500',
    lineHeight: ms(16),
  },
  wrapper: {},
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: vs(10),
    fontWeight: '600',
    color: colors.muted,
  },
  value: {
    fontSize: vs(16),
    fontWeight: '700',
    color: colors.reminderBgHardest,
  },
});
