import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

import { Layout } from '@shared/components/Layout';
import { spacing, colors } from '@shared/theme';

import { ms, vs } from 'react-native-size-matters';
import TextElement from '@shared/components/TextElement/TextElement';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '@features/Auth/AuthProvider';
import ListView from '@shared/components/ListView/ListView';
import StatsAchievements from '../components/StatsAchievements';
import ProfileMenu from '../components/ProfileMenu';
import { useMyProfileData } from '../hooks/useMyProfileData';

export default function MyProfileMainScreen() {
  const { user } = useAuth();
  const { data: MyProfileData, isLoading, isError, error } = useMyProfileData();
  const navigation = useNavigation();

  if (!user) {
    navigation.navigate('Auth');
    return null;
  }

  return (
    <Layout
      allowPaddingVertical={true}
      allowPaddingHorizontal
      style={{ marginTop: 0, paddingTop: 0 }}
    >
      <ListView
        style={{}}
        scrollViewProps={{
          contentContainerStyle: { width: '100%' },
        }}
      >
        <ProfileHeader
          avatarUri={user ? MyProfileData?.photo : undefined}
          name={user ? (MyProfileData?.name ?? '') : ''}
          username={user ? (MyProfileData?.name ?? '') : ''}
          following={user ? (MyProfileData?.followingCount ?? 0) : 0}
          followers={user ? (MyProfileData?.followersCount ?? 0) : 0}
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
