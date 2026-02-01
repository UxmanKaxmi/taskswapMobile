import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Height } from '@shared/components/Spacing';
import { TaskDetailHeader } from './TaskDetailHeader';
import TaskCardGradient from '@features/Home/components/TaskCardGradient';

type Props = {
  task: any; // replace with Task type
};

export function TaskDetailHero({ task }: Props) {
  return (
    <TaskCardGradient type={task.type} style={styles.wrapper}>
      <View style={styles.content}>
        <TaskDetailHeader task={task} />
        <Height size={8} />
      </View>
    </TaskCardGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
});
