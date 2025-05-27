import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@shared/theme/useTheme';
import { TaskType } from '@features/Tasks/types/tasks';
import { getTypeVisual } from '@shared/utils/typeVisuals';

type Props = {
  selected: TaskType;
  onSelect: (type: TaskType) => void;
};

const taskTypes: TaskType[] = ['reminder', 'decision', 'motivation', 'advice'];

export default function TaskTypeSelector({ selected, onSelect }: Props) {
  const { colors } = useTheme();

  const scaleAnim = useRef<Record<TaskType, Animated.Value>>({
    reminder: new Animated.Value(1),
    decision: new Animated.Value(1),
    motivation: new Animated.Value(1),
    advice: new Animated.Value(1),
  }).current;

  useEffect(() => {
    taskTypes.forEach(type => {
      Animated.spring(scaleAnim[type], {
        toValue: type === selected ? 1.3 : 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    });
  }, [selected]);

  return (
    <View style={styles.grid}>
      {taskTypes.map(type => {
        const { emoji } = getTypeVisual(type);
        const isSelected = selected === type;

        return (
          <TouchableOpacity
            key={type}
            style={[
              styles.button,
              {
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.primary : 'transparent',
              },
            ]}
            onPress={() => onSelect(type)}
          >
            <Animated.Text
              style={[
                styles.emoji,
                {
                  transform: [{ scale: scaleAnim[type] }],
                  opacity: isSelected ? 1 : 0.7,
                },
              ]}
            >
              {emoji}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.label,
                {
                  color: isSelected ? colors.onPrimary : colors.text,
                },
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  button: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontWeight: '500',
    fontSize: 16,
  },
});
