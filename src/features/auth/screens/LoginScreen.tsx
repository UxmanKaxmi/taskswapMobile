import React from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { useAuth } from '../AuthProvider';
import { moderateScale, verticalScale } from 'react-native-size-matters';
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();

  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();
  const navigation = useNavigation();
  const hasAnimated = React.useRef(false);
  const redirectTo =
    route.params?.redirectTo && typeof route.params.redirectTo === 'string'
      ? route.params.redirectTo
      : 'Home';

  console.log('Redirect to:', redirectTo, route);

  const AnimatedFeatureRow = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    return (
      <Animated.View
        entering={
          hasAnimated.current
            ? undefined
            : FadeInDown.duration(240).delay(delay).springify().damping(18)
        }
        onLayout={() => {
          hasAnimated.current = true;
        }}
      >
        {children}
      </Animated.View>
    );
  };

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
    <Layout backgroundColor="onAccent">
      <AppHeader showNavigation />

      <Column flex>
        {/* Login Title */}
        <Animated.View entering={FadeIn.duration(220)}>
          <TextElement variant="title" style={styles.title}>
            Unlock Your Full Experience
          </TextElement>
        </Animated.View>

        {/* Motivational Tagline */}
        <TextElement variant="caption" style={styles.tagline}>
          Create an account to save your progress, support others, and that helps you stay
          consistent.
        </TextElement>

        <Height size={20} />

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <AnimatedFeatureRow delay={0}>
            <View style={styles.featureItem}>
              <Icon
                set="fa6"
                name="chart-line"
                iconStyle="solid"
                size={20}
                color={colors.primary}
              />
              <TextElement variant="subtitle" style={styles.featureText}>
                Track your progress and daily streaks
              </TextElement>
            </View>
          </AnimatedFeatureRow>

          <AnimatedFeatureRow delay={90}>
            <View style={styles.featureItem}>
              <Icon set="fa6" name="user" size={20} color={colors.primary} />
              <TextElement variant="subtitle" style={styles.featureText}>
                Support friends and share updates
              </TextElement>
            </View>
          </AnimatedFeatureRow>

          <AnimatedFeatureRow delay={180}>
            <View style={styles.featureItem}>
              <Icon set="fa6" name="bell" size={20} color={colors.primary} />
              <TextElement variant="subtitle" style={styles.featureText}>
                Get gentle, personalized reminders
              </TextElement>
            </View>
          </AnimatedFeatureRow>
        </View>
      </Column>

      <Height size={40} />

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <PrimaryButton isLoading={loading} title="Continue with Google" onPress={handleLogin} />
        <TextElement
          variant="caption"
          color="muted"
          style={{ textAlign: 'center', fontSize: moderateScale(12) }}
        >
          We&apos;ll never post without your permission.
        </TextElement>
      </View>

      <Height size={20} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  tagline: {
    fontSize: moderateScale(16),
    color: colors.muted,
    marginBottom: 10,
  },
  title: {
    textAlign: 'left',
    fontWeight: '700',
    fontSize: moderateScale(28),
    marginBottom: moderateScale(8),
    marginTop: verticalScale(28),
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
    fontSize: moderateScale(18),
    marginLeft: moderateScale(5),
  },
  buttonContainer: {
    width: '100%',
  },
});
