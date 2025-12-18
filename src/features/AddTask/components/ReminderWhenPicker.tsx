import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { colors, spacing } from '@shared/theme';
import { ms, vs } from 'react-native-size-matters';
import Icon from '@shared/components/Icons/Icon';
import DatePicker from 'react-native-date-picker';
import { format, isToday, isTomorrow } from 'date-fns';
import { typeIcons } from '@shared/utils/typeVisuals';
import { Shadow } from '@shared/components/Shadow';

type Props = {
  date: Date;
  time: Date;
  minDate: Date; // 👈 ADD THIS

  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
};

export default function ReminderWhenPicker({
  date,
  time,
  minDate,
  onDateChange,
  onTimeChange,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const minTime = isSameDay(date, minDate) ? minDate : new Date(date.setHours(0, 0, 0, 0));
  const dateLabel = isToday(date)
    ? 'Today'
    : isTomorrow(date)
      ? 'Tomorrow'
      : format(date, 'EEE, MMM d');

  const timeLabel = format(time, 'p');

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Icon set="ion" name={'time'} size={ms(16)} color={colors.reminderBgHardest} />
        <TextElement color={'reminderBgHardest'} style={styles.headerText} weight="600">
          When?
        </TextElement>
      </View>

      <Row gap={spacing.sm}>
        {/* DATE */}
        <Shadow size="tint" style={styles.card}>
          <Pressable onPress={() => setShowDatePicker(true)}>
            <TextElement style={styles.label}>Date</TextElement>
            <TextElement style={styles.value}>{dateLabel}</TextElement>
          </Pressable>
        </Shadow>

        {/* TIME */}
        <Shadow size="tint" style={styles.card}>
          <Pressable onPress={() => setShowTimePicker(true)}>
            <TextElement style={styles.label}>Time</TextElement>
            <TextElement style={styles.value}>{timeLabel}</TextElement>
          </Pressable>
        </Shadow>
      </Row>

      {/* DATE PICKER */}
      <DatePicker
        modal
        open={showDatePicker}
        date={date}
        mode="date"
        minimumDate={minDate}
        onConfirm={selected => {
          setShowDatePicker(false);
          onDateChange(selected);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* TIME PICKER */}
      <DatePicker
        modal
        open={showTimePicker}
        date={time}
        minimumDate={minTime} // 👈 THIS IS THE IMPORTANT PART
        mode="time"
        onConfirm={selected => {
          setShowTimePicker(false);
          onTimeChange(selected);
        }}
        onCancel={() => setShowTimePicker(false)}
      />

      <TextElement color={'reminderBgHardest'} style={styles.noteText}>
        Just a heads-up — reminders need to be at least 2 hours from now
      </TextElement>
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
  wrapper: {
    // marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: vs(12),
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
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
    // marginBottom: spacing.sm,
  },
  value: {
    fontSize: vs(16),
    fontWeight: '700',
    color: colors.reminderBgHardest,
  },
});
