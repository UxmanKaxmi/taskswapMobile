import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout } from '@shared/components/Layout';
import { spacing, colors } from '@shared/theme';

import { vs } from 'react-native-size-matters';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '@features/Auth/AuthProvider';
import ListView from '@shared/components/ListView/ListView';
import StatsAchievements from '../components/StatsAchievements';
import ProfileMenu from '../components/ProfileMenu';
import { useMyProfileData } from '../hooks/useMyProfileData';
import { isAndroid } from '@shared/utils/constants';

export default function MyProfileMainScreen() {
  const { user } = useAuth();
  const { data: MyProfileData } = useMyProfileData();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  if (!user) {
    navigation.navigate('Auth');
    return null;
  }

  return (
    <Layout
      allowPaddingHorizontal={false}
      allowPaddingVertical
      backgroundColor={colors.onboardingPaper}
      style={{
        marginTop: isAndroid ? insets.top : 0, // ✅ negative margin to offset SafeAreaView padding
      }}
    >
      <View style={styles.screen}>
        <ListView
          style={{ flex: 1 }}
          scrollViewProps={{
            contentContainerStyle: {
              width: '100%',
              paddingHorizontal: spacing.lg,
              paddingTop: vs(18),
              paddingBottom: insets.bottom + vs(50),
            },
          }}
        >
          <ProfileHeader
            userId={user ? MyProfileData?.id : undefined}
            avatarUri={user ? MyProfileData?.photo : undefined}
            name={user ? (MyProfileData?.name ?? '') : ''}
            username={user ? (MyProfileData?.email ?? '') : ''}
            following={user ? (MyProfileData?.followingCount ?? 0) : 0}
            followers={user ? (MyProfileData?.followersCount ?? 0) : 0}
            onEditProfile={() => {}}
            onShareProfile={() => {}}
          />

          <StatsAchievements
            pushesGiven={MyProfileData?.pushesGiven ?? MyProfileData?.taskSuccessRate ?? 0}
            tasksDone={MyProfileData?.tasksDone ?? 0}
            dayStreak={MyProfileData?.dayStreak ?? 0}
          />
          <ProfileMenu />
        </ListView>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
