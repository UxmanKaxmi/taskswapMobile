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

  return (
    <Layout allowPadding centered style={{}}>
      <ListView
        scrollViewProps={{
          contentContainerStyle: { width: '100%' },
        }}
      >
        <ProfileHeader
          {...mockProfile}
          // avatarUri={user.avatarUri}
          // name={user.name}
          // username={user.username}
          // following={user.following}
          // followers={user.followers}
          // onEditProfile={() => /* navigate to edit */ }
          // onShareProfile={() => /* share link */ }
        />

        <StatsAchievements {...mockStats} />
        <ProfileMenu />
      </ListView>
    </Layout>
  );
}

const styles = StyleSheet.create({});
