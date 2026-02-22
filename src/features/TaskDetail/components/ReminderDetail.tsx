import React, { useState } from 'react';
import { View } from 'react-native';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import ReminderNoteList from '@features/Tasks/components/ReminderNoteList';
import { useRemindersForTask } from '@features/Home/hooks/useRemindersForTask';
import { openFriendsProfile } from '@navigation/types/navigationUtils';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '@navigation/types/navigation';
import { useAuth } from '@features/Auth/AuthProvider';

type Props = {
  task: {
    id: string;
  };
};

export default function ReminderDetail({ task }: Props) {
  const [viewAll, setViewAll] = useState(false);
  const { data: reminders, isLoading, isError } = useRemindersForTask(task.id);
  const totalReminders = reminders?.length ?? 0;
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user } = useAuth();

  console.log('reminders', reminders);
  return (
    <View>
      {totalReminders > 0 && (
        <SectionHeader
          label="Reminder history"
          icon="time"
          // rightLabel={`${viewAll ? 'Collapse all' : 'View all'} (${totalReminders})`}
          // onPressRightIcon={() => setViewAll(prev => !prev)}
        />
      )}

      <ReminderNoteList
        reminders={reminders}
        isLoading={isLoading}
        isError={isError}
        onPressFriendProfile={friendId => openFriendsProfile(navigation, friendId, user?.id)}
        onPressRemainingLink={() => setViewAll(true)}
        viewAll={viewAll}
      />
    </View>
  );
}
