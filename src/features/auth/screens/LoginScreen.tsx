import React from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { useAuth } from '../AuthProvider';
import { moderateScale } from 'react-native-size-matters';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Column from '@shared/components/Layout/Column';
import { Height } from '@shared/components/Spacing';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import Icon from '@shared/components/Icons/Icon';
import { colors } from '@shared/theme';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  AppStackParamList,
  AuthStackParamList,
  BottomTabParamList,
} from '@navigation/types/navigation';
import { TAB_SCREENS } from '@shared/utils/helperFunctions';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();

  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();
  const navigation = useNavigation();

  const redirectTo =
    route.params?.redirectTo && typeof route.params.redirectTo === 'string'
      ? route.params.redirectTo
      : 'Home';

  console.log('Redirect to:', redirectTo, route);

  const handleLogin = async () => {
    try {
      await signIn();

      const isTab = TAB_SCREENS.includes(redirectTo as any);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'App',
            state: {
              routes: isTab
                ? [
                    {
                      name: 'Tabs',
                      state: {
                        index: 0,
                        routes: [{ name: redirectTo as keyof BottomTabParamList }],
                      },
                    },
                  ]
                : [
                    {
                      name: 'Tabs',
                    },
                    {
                      name: redirectTo as keyof AppStackParamList,
                      params: route.params?.params,
                    },
                  ],
            },
          },
        ],
      });
    } catch (e) {
      Alert.alert('Login failed', e.message);
    }
  };

  return (
    <Layout>
      <AppHeader showNavigation />

      <Column flex>
        {/* Login Title */}
        <TextElement variant="title" style={styles.title}>
          Sign In to Unlock Full Access
        </TextElement>

        {/* Motivational Tagline */}
        <TextElement variant="caption" style={styles.tagline}>
          You're almost there — let's make your progress truly yours.
        </TextElement>

        <Height size={20} />

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Icon set="ion" name="trail-sign-outline" size={16} color={colors.primary} />
            <TextElement variant="subtitle" style={styles.featureText}>
              Track your daily streaks
            </TextElement>
          </View>
          <View style={styles.featureItem}>
            <Icon set="fa6" name="user" size={16} color={colors.primary} />
            <TextElement variant="subtitle" style={styles.featureText}>
              Motivate friends & share updates
            </TextElement>
          </View>
          <View style={styles.featureItem}>
            <Icon set="fa6" name="bell" size={16} color={colors.primary} />
            <TextElement variant="subtitle" style={styles.featureText}>
              Get personalized reminders
            </TextElement>
          </View>
        </View>
      </Column>

      <Height size={40} />

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <PrimaryButton isLoading={loading} title="Continue with Google" onPress={handleLogin} />
      </View>

      <Height size={20} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  tagline: {
    fontSize: moderateScale(14),
    color: '#666',
    marginBottom: 10,
  },
  title: {
    textAlign: 'left',
    fontWeight: '700',
    fontSize: moderateScale(24),
    marginBottom: moderateScale(8),
  },
  featuresContainer: {
    marginTop: 0,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    color: colors.muted,
  },
  buttonContainer: {
    width: '100%',
  },
});
