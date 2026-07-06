import React, { useCallback } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Layout } from '@shared/components/Layout';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';

import { ms, vs } from 'react-native-size-matters';
import ProfileHeader from '../components/ProfileHeader';
import { useAuth } from '@features/Auth/AuthProvider';
import ListView from '@shared/components/ListView/ListView';
import StatsAchievements from '../components/StatsAchievements';
import ProfileMenu from '../components/ProfileMenu';
import { useMyProfileData } from '../hooks/useMyProfileData';
import TextElement from '@shared/components/TextElement/TextElement';
import { showToast } from '@shared/utils/toast';
import {
  APP_NAME,
  APP_VERSION,
  isAndroid,
  PRIVACY_POLICY_URL,
  TERMS_URL,
} from '@shared/utils/constants';

export default function MyProfileMainScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: MyProfileData } = useMyProfileData();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);

  const openLegalLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      showToast({
        type: 'error',
        title: 'Could not open link',
        message: 'Please try again later.',
      });
    });
  }, []);

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

          <View style={styles.footer}>
            <View style={styles.legalRow}>
              <TextElement
                style={styles.legalLink}
                suppressHighlighting
                onPress={() => openLegalLink(PRIVACY_POLICY_URL)}
              >
                Privacy Policy
              </TextElement>
              <TextElement style={styles.legalSeparator}> · </TextElement>
              <TextElement
                style={styles.legalLink}
                suppressHighlighting
                onPress={() => openLegalLink(TERMS_URL)}
              >
                Terms of Service
              </TextElement>
            </View>
            <TextElement style={styles.versionText}>
              {APP_NAME} {APP_VERSION} · beta
            </TextElement>
          </View>
        </ListView>
      </View>
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    footer: {
      alignItems: 'center',
      marginTop: vs(16),
    },
    legalRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legalLink: {
      color: colors.onboardingInkSoft,
      fontSize: ms(12),
      lineHeight: ms(16),
      fontWeight: '600',
    },
    legalSeparator: {
      color: colors.onboardingMuted,
      fontSize: ms(12),
      lineHeight: ms(16),
    },
    versionText: {
      marginTop: vs(3),
      color: colors.onboardingMuted,
      fontSize: ms(11),
      lineHeight: ms(15),
    },
  });
