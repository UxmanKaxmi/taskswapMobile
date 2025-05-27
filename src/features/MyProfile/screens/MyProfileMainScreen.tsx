import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { Layout } from '@shared/components/Layout';
import { spacing, colors } from '@shared/theme';

import { ms, vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '@features/Auth/authProvider';
import ListView from '@shared/components/ListView/ListView';
import StatsAchievements from '../components/StatsAchievements';
import ProfileMenu from '../components/ProfileMenu';
import { useMyProfileData } from '../hooks/useMyProfileData';

export const mockProfile = {
  avatarUri: 'https://i.pravatar.cc/150?img=47',
  name: 'Jane Doe',
  username: 'janedoe',
  following: 128,
  followers: 1345, // will render as “1.3k”
  onEditProfile: () => {
    console.log('Edit Profile clicked');
  },
  onShareProfile: () => {
    console.log('Share Profile clicked');
  },
};

export const mockStats = {
  karmaPoints: 156,
  tasksDone: 42,
  dayStreak: 7,
  achievements: [
    { icon: 'trophy', label: 'Super Helper' },
    { icon: 'fire', label: '7 Day Streak' },
    { icon: 'star', label: 'Top Rated' },
    // —you can add more if you like—
    // { icon: 'thumbs-up', label: 'Community Favorite' },
  ],
};

export default function MyProfileMainScreen() {
  const { user } = useAuth();
  const { data: MyProfileData, isLoading, isError, error } = useMyProfileData();
  return (
    <Layout allowPadding style={{ marginTop: 0, paddingTop: 0 }}>
      <ListView
        style={{}}
        scrollViewProps={{
          contentContainerStyle: { width: '100%' },
        }}
      >
        <ProfileHeader
          avatarUri={MyProfileData?.photo}
          name={MyProfileData?.name || 'No Name'}
          username={MyProfileData?.name || 'no username'}
          following={MyProfileData?.followingCount ?? 0}
          followers={MyProfileData?.followersCount ?? 0}
          onEditProfile={() => {}}
          onShareProfile={() => {}}
        />

        <StatsAchievements
          tasksDone={MyProfileData?.tasksDone ?? 0}
          dayStreak={MyProfileData?.dayStreak ?? 0}
          taskSuccessRate={MyProfileData?.taskSuccessRate ?? 0}
        />
        <ProfileMenu />
      </ListView>
    </Layout>
  );
}

const styles = StyleSheet.create({});
