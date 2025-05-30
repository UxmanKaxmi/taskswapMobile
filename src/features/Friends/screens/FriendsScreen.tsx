import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';

import { Layout } from '@shared/components/Layout';
import { spacing, colors } from '@shared/theme';

import { ms, vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import { useAuth } from '@features/Auth/authProvider';
import ListView from '@shared/components/ListView/ListView';
import FriendsProfileHeader from '../components/FriendsProfileHeader';
import { useFriendProfile } from '../hooks/useFriendProfile';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import { isAndroid } from '@shared/utils/constants';
import { Edge } from 'react-native-safe-area-context';
import ReminderCard from '@features/Home/components/ReminderCard';
import RecentTaskCard from '../components/RecentTaskCard';
import { useToggleFollow } from '@features/User/hooks/useToggleFollow';
import FriendsStatsAchievements from '../components/FriendsStatsAchievements';
import { Height } from '@shared/components/Spacing';
// export const mockProfile = {
//   avatarUri: 'https://i.pravatar.cc/150?img=47',
//   name: 'Jane Doe',
//   username: 'janedoe',
//   following: 128,
//   followers: 1345, // will render as “1.3k”
//   onEditProfile: () => {
//     console.log('Edit Profile clicked');
//   },
//   onShareProfile: () => {
//     console.log('Share Profile clicked');
//   },
// };

// export const mockStats = {
//   karmaPoints: 156,
//   tasksDone: 42,
//   dayStreak: 7,
//   achievements: [
//     { icon: 'trophy', label: 'Super Helper' },
//     { icon: 'fire', label: '7 Day Streak' },
//     { icon: 'star', label: 'Top Rated' },
//     // —you can add more if you like—
//     // { icon: 'thumbs-up', label: 'Community Favorite' },
//   ],
// };

export default function FriendsScreen() {
  const route = useRoute<any>();
  const friendId = route.params?.id;

  const { data: profile, isLoading, isError } = useFriendProfile(friendId);

  const { mutate: toggleFollow } = useToggleFollow();

  const handleToggleFollow = (userId: string) => {
    toggleFollow(userId);
  };

  if (!friendId) {
    return <TextElement style={styles.errorText}>Invalid profile ID</TextElement>;
  }

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: spacing.lg }} size="large" />;
  }

  if (isError || !profile) {
    return <TextElement style={styles.errorText}>Failed to load profile</TextElement>;
  }

  const edges: Edge[] = isAndroid
    ? ['right', 'left', 'bottom', 'top']
    : ['right', 'left', 'bottom'];

  return (
    <Layout allowPadding edges={edges} style={{}}>
      <AppHeader showTitle={false} />
      <ListView
        style={{}}
        scrollViewProps={{
          contentContainerStyle: { width: '100%' },
        }}
      >
        <FriendsProfileHeader
          avatarUri={profile.photo}
          name={profile?.name || 'No Name'}
          username={profile?.name || 'no username'}
          following={profile?.followingCount ?? 0}
          followers={profile?.followersCount ?? 0}
          email={profile.email}
          heFollowsYou={profile.isFollowedBy}
          youFollowHim={profile.isFollowing}
          onPressToggleFollow={() => handleToggleFollow(profile.id)}
        />

        <FriendsStatsAchievements
          tasksDone={profile?.tasksDone ?? 0}
          dayStreak={profile?.dayStreak ?? 0}
          taskSuccessRate={profile?.taskSuccessRate ?? 0}
        />
        <Height size={20} />

        <TextElement
          variant="subtitle"
          style={{ marginTop: spacing.xs, marginLeft: spacing.md, fontWeight: '600' }}
        >
          Recent Tasks
        </TextElement>

        <View style={{ gap: spacing.sm, marginVertical: spacing.md }}>
          {profile.recentTasks.length === 0 ? (
            <TextElement variant="caption" color="muted" style={{ textAlign: 'center' }}>
              No recent tasks...
            </TextElement>
          ) : (
            profile.recentTasks.map(task => <RecentTaskCard key={task.id} task={task} />)
          )}
        </View>
      </ListView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  errorText: {
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.error,
  },
});
