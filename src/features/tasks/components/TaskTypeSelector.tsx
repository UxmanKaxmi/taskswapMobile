// src/features/tasks/components/TaskTypeSelector.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

type TaskType = 'reminder' | 'decision' | 'motivation' | 'advice';

interface TaskTypeSelectorProps {
  value: TaskType;
  onChange: (type: TaskType) => void;
}

export const TaskTypeSelector: React.FC<TaskTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>Task Type</Text>
      <Picker
        selectedValue={value}
        onValueChange={itemValue => onChange(itemValue as TaskType)}
        style={{ height: 50, width: 200 }}
      >
        <Picker.Item label="Reminder" value="reminder" />
        <Picker.Item label="Decision" value="decision" />
        <Picker.Item label="Motivation" value="motivation" />
        <Picker.Item label="Advice" value="advice" />
      </Picker>
    </View>
  );
};
