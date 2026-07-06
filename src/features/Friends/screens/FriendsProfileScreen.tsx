import React, { useCallback } from 'react';
import { ListRenderItem, StyleSheet, View } from 'react-native';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';

import { Layout } from '@shared/components/Layout';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';

import { vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import ListView from '@shared/components/ListView/ListView';
import FriendsProfileHeader from '../components/FriendsProfileHeader';
import { useFriendProfile } from '../hooks/useFriendProfile';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import ReminderCard from '@features/Home/components/ReminderCard';
import { useToggleFollow } from '@features/User/hooks/useToggleFollow';
import FriendsStatsAchievements from '../components/FriendsStatsAchievements';
import { Height } from '@shared/components/Spacing';
import AppLoader from '@shared/components/Loader/Loader';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import DecisionCard from '@features/Home/components/DecisionCard';
import MotivationCard from '@features/Home/components/MotivationCard';
import AdviceCard from '@features/Home/components/AdviceCard';
import { Goal } from '@features/Goals/types/goals';
import { AppStackParamList } from '@navigation/types/navigation';
import { navigateToGoalDetails, useCheckAuthThenNavigate } from '@navigation/types/navigationUtils';
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

export default function FriendsProfileScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const route = useRoute<any>();
  const friendId = route.params?.id;

  const { data: profile, isLoading, isError } = useFriendProfile(friendId);

  const { mutate: toggleFollow } = useToggleFollow();
  const checkAuthThenNavigate = useCheckAuthThenNavigate();

  const handleToggleFollow = (userId: string) => {
    if (
      !checkAuthThenNavigate(
        'FriendsProfileScreen',
        { id: userId },
        {
          authContext: 'Follow',
        },
      )
    ) {
      return;
    }

    toggleFollow(userId);
  };

  const onPressGoal = useCallback(
    (task: Goal) => {
      navigateToGoalDetails(navigation, task);
    },
    [navigation],
  );

  const onNoopGoalAction = useCallback((_task: Goal) => {}, []);

  const onSuggestAdvice = useCallback(
    (task: Goal) => {
      checkAuthThenNavigate(
        'GoalDetail',
        {
          taskId: task.id,
          openAdviceComposer: true,
        },
        {
          authContext: 'Advice',
        },
      );
    },
    [checkAuthThenNavigate],
  );

  const renderGoalNew = useCallback<ListRenderItem<Goal>>(
    ({ item }) => {
      switch (item.type) {
        case 'decision':
          return <DecisionCard task={item as any} onPressCard={onPressGoal as any} />;
        case 'reminder':
          return <ReminderCard task={item as any} onPressCard={onPressGoal as any} />;
        case 'motivation':
          return (
            <MotivationCard
              task={item as any}
              onPressCard={onPressGoal as any}
              onPressSuggest={onNoopGoalAction as any}
              onPressView={onNoopGoalAction as any}
            />
          );
        case 'advice':
          return (
            <AdviceCard
              task={item as any}
              onPressCard={onPressGoal as any}
              onPressSuggest={onSuggestAdvice as any}
              onPressView={onNoopGoalAction as any}
            />
          );
        default:
          return null;
      }
    },
    [onPressGoal, onNoopGoalAction, onSuggestAdvice],
  );

  return (
    <Layout allowPaddingHorizontal={false} backgroundColor={colors.onboardingPaper}>
      <View style={styles.headerWrap}>
        <AppHeader showTitle={false} />
      </View>

      {isLoading && <AppLoader visible />}

      {!friendId ? (
        <TextElement style={styles.errorText}>Invalid profile ID</TextElement>
      ) : isError || !profile ? (
        <TextElement style={styles.errorText}>Failed to load profile</TextElement>
      ) : (
        <ListView
          style={{ flex: 1 }}
          scrollViewProps={{
            contentContainerStyle: {
              width: '100%',
              paddingHorizontal: spacing.lg,
              paddingBottom: vs(40),
            },
          }}
        >
          <FriendsProfileHeader
            userId={profile.id}
            avatarUri={profile.photo}
            name={profile?.name || 'No Name'}
            username={profile?.username}
            following={profile?.followingCount ?? 0}
            followers={profile?.followersCount ?? 0}
            heFollowsYou={profile.isFollowedBy}
            youFollowHim={profile.isFollowing}
            onPressToggleFollow={() => handleToggleFollow(profile.id)}
          />

          <FriendsStatsAchievements
            pushesGiven={profile?.pushesGiven ?? profile?.taskSuccessRate ?? 0}
            tasksDone={profile?.tasksDone ?? 0}
            dayStreak={profile?.dayStreak ?? 0}
          />
          <Height size={vs(5)} />

          {profile.recentTasks.length !== 0 && (
            <SectionHeader label="Recent tasks" icon="calendar-outline" />
          )}
          {/* 
          <TextElement variant="subtitle" style={{ marginTop: spacing.xs, fontWeight: '600' }}>
            Recent Goals
          </TextElement> */}

          <View style={styles.recentTasks}>
            {profile.recentTasks.length === 0 ? (
              <TextElement
                variant="caption"
                color="muted"
                style={{ textAlign: 'left' }}
              ></TextElement>
            ) : (
              profile.recentTasks.map(task => (
                <React.Fragment key={task.id}>
                  {renderGoalNew({ item: task as Goal } as any)}
                </React.Fragment>
              ))
            )}
          </View>
        </ListView>
      )}
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    headerWrap: {
      paddingHorizontal: spacing.lg,
    },
    recentTasks: {
      gap: spacing.sm,
      marginHorizontal: -spacing.lg,
      marginBottom: vs(40),
    },
    errorText: {
      textAlign: 'center',
      marginTop: spacing.xl,
      color: colors.error,
    },
  });
