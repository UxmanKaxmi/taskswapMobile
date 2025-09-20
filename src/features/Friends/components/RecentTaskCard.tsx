import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import Avatar from '@shared/components/Avatar/Avatar';
import { colors, spacing } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import { getTypeVisual } from '@shared/utils/typeVisuals';
import { FriendTask } from '../types/friends';
import DecisionCard from '@features/Home/components/DecisionCard';
import ReminderCard from '@features/Home/components/ReminderCard';
import MotivationCard from '@features/Home/components/MotivationCard';
import AdviceCard from '@features/Home/components/AdviceCard';
import { navigateToTaskDetails, openFriendsProfile } from '@navigation/navigationUtils';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/navigation';
import { Task } from '@features/Tasks/types/tasks';

type Props = {
  task: FriendTask;
  onPress?: () => void;
};

export default function RecentTaskCard({ task, onPress }: Props) {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const { emoji } = getTypeVisual(task.type);
  console.log(task, 'ttt');

  const renderTaskNew = ({ item }: { item: Task }) => {
    console.log(item.type, 'item.type');
    switch (item.type) {
      case 'decision':
        return (
          <DecisionCard
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressSuggest={t => console.log('onPressProfile', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'reminder':
        return (
          <ReminderCard
            onRemind={() => {}}
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressProfile={t => openFriendsProfile(navigation, t.userId)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'motivation':
        return (
          <MotivationCard
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      case 'advice':
        return (
          <AdviceCard
            key={item.id}
            task={item as any}
            onPressCard={() => navigateToTaskDetails(navigation, item)}
            onPressSuggest={t => console.log('Suggest for', t.id)}
            onPressView={t => console.log('View for', t.id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <TextElement variant="caption" color="muted">
          {timeAgo(task.createdAt)} • {task.type}
        </TextElement>
        <TextElement>{emoji}</TextElement>
      </View>

      <TextElement variant="body" weight="bold" style={styles.text}>
        {task.text}
      </TextElement>

      {task.helpers.length > 0 && (
        <View style={styles.helpers}>
          {task.helpers.map(helper => (
            <Avatar
              key={helper.id}
              uri={helper.photo}
              fallback={helper.name[0]}
              size={28}
              borderColor={colors.border}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  text: {
    marginBottom: spacing.sm,
  },
  helpers: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
