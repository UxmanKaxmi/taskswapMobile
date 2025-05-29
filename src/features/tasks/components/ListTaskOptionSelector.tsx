// src/shared/components/Inputs/ListTaskOptionSelector.tsx

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { useTheme } from '@shared/theme/useTheme';
import { colors } from '@shared/theme';
import { ms } from 'react-native-size-matters';
import { isIOS } from '@shared/utils/constants';
import DatePicker from 'react-native-date-picker';
import { format, isToday, isTomorrow, isValid, parseISO } from 'date-fns';

const TaskOptionValue = ({ value }: { value?: string }) => {
  const { colors } = useTheme();

  if (!value) return null;

  const parsedDate = value.includes('T') ? parseISO(value) : new Date(value);

  if (!isValid(parsedDate)) {
    return <TextElement style={[styles.value, { color: colors.error }]}>Invalid date</TextElement>;
  }

  let display = format(parsedDate, 'EEEE, MMMM d - p');
  if (isToday(parsedDate)) {
    display = `Today at ${format(parsedDate, 'p')}`;
  } else if (isTomorrow(parsedDate)) {
    display = `Tomorrow at ${format(parsedDate, 'p')}`;
  }

  return (
    <TextElement variant="subtitle" style={[styles.value, { color: colors.primary }]}>
      {display}
    </TextElement>
  );
};

type Props = {
  icon: string;
  label: string;
  iconSet?: 'ion' | 'fa6';
  value?: string;
  valueType?: 'date' | 'text'; // 👈 Add this
  onPress?: () => void;
  showDateTimePicker?: boolean;
  dateTimeValue?: Date;
  onDateTimeChange?: (newDate: Date) => void;
  defaultPickerOpen?: boolean;
  error?: boolean;
  errorText?: string;
};

export default function ListTaskOptionSelector({
  icon,
  label,
  value,
  valueType,
  iconSet,
  onPress,
  showDateTimePicker = false,
  dateTimeValue = new Date(),
  defaultPickerOpen = false,
  error,
  errorText,
  onDateTimeChange,
}: Props) {
  const { colors, spacing } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = (selectedDate: Date) => {
    setShowPicker(false);
    if (onDateTimeChange) {
      onDateTimeChange(selectedDate);
    }
  };

  const handlePress = () => {
    if (showDateTimePicker) {
      setShowPicker(true);
    } else {
      onPress?.();
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.container, { borderColor: error ? colors.error : colors.border }]}
      >
        <View style={styles.row}>
          <Icon set={iconSet ?? 'ion'} name={icon as any} size={ms(25)} color={colors.text} />
          <TextElement variant="subtitle" style={[styles.label, { color: colors.text }]}>
            {label}
          </TextElement>
        </View>
        <View style={styles.row}>
          {value && valueType === 'date' && <TaskOptionValue value={value} />}
          {value && valueType === 'text' && (
            <TextElement variant="subtitle" style={[styles.value, { color: colors.primary }]}>
              {value}
            </TextElement>
          )}
          {!showDateTimePicker && !showPicker && !dateTimeValue && (
            <Icon set="ion" name="chevron-forward" size={spacing.md} color={colors.muted} />
          )}
        </View>
      </TouchableOpacity>

      <DatePicker
        modal
        open={showPicker}
        date={dateTimeValue}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={() => setShowPicker(false)}
        minimumDate={new Date()}
        theme={'light'}
      />

      {errorText && (
        <TextElement style={{ color: colors.error, marginTop: 4, fontSize: ms(12) }}>
          {errorText}
        </TextElement>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 12,
    fontSize: ms(16),
  },
  value: {
    marginRight: 8,
    fontSize: ms(14),
    fontWeight: '500',
  },
});
