import React from 'react';
import { View, StyleSheet, Alert, Pressable, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthProvider';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import Column from '@shared/components/Layout/Column';
import { Height } from '@shared/components/Spacing';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import Icon from '@shared/components/Icons/Icon';
import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import {
  AppStackParamList,
  AuthStackParamList,
  BottomTabParamList,
} from '@navigation/types/navigation';
import { TAB_SCREENS } from '@shared/utils/helperFunctions';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { isAppleSignInSupported } from '@shared/utils/appleAuth';
import type { AuthProviderName } from '../api/types';

function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <Path
        fill="#FBBC05"
        d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.33Z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { signIn, loading } = useAuth();
  const [signingInProvider, setSigningInProvider] = React.useState<AuthProviderName | null>(null);

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

  const loginLoading = loading || !!signingInProvider;
  const appleSignInSupported = isAppleSignInSupported();

  const redirectAfterLogin = () => {
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
  };

  const handleLogin = async (provider: AuthProviderName = 'google') => {
    if (loginLoading) return;

    try {
      setSigningInProvider(provider);
      await signIn(provider);
      redirectAfterLogin();
    } catch (e) {
      const errorCode = typeof e === 'object' && e && 'code' in e ? String(e.code) : null;

      if (
        provider === 'apple' &&
        (errorCode === '1001' ||
          errorCode === 'ERR_REQUEST_CANCELED' ||
          (e instanceof Error && e.message.toLowerCase().includes('canceled')))
      ) {
        return;
      }

      Alert.alert('Login failed', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSigningInProvider(null);
    }
  };

  return (
    <Layout backgroundColor={colors.onboardingPaper}>
      <AppHeader showNavigation />

      <Column flex fullWidth style={styles.content}>
        <Animated.View entering={FadeIn.duration(220)}>
          <View style={styles.titleBlock}>
            <View style={styles.titleLine}>
              <TextElement variant="title" weight="800" style={styles.titleText}>
                Unlock your
              </TextElement>
              <View style={styles.highlightedWord}>
                <View style={styles.titleUnderline} />
                <TextElement variant="title" weight="800" style={styles.titleText}>
                  full
                </TextElement>
              </View>
            </View>
            <TextElement variant="title" weight="800" style={styles.titleText}>
              experience
            </TextElement>
          </View>
        </Animated.View>

        <TextElement variant="caption" style={styles.tagline}>
          Create an account to keep your momentum, push others forward, and stay consistent.
        </TextElement>

        <View style={styles.featuresContainer}>
          <AnimatedFeatureRow delay={0}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Icon
                  set="fa6"
                  name="chart-line"
                  iconStyle="solid"
                  size={18}
                  color={colors.tactileMomentumSecondary}
                />
              </View>
              <TextElement variant="subtitle" style={styles.featureText}>
                Track your momentum and streaks
              </TextElement>
            </View>
          </AnimatedFeatureRow>

          <AnimatedFeatureRow delay={90}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Icon
                  set="fa6"
                  name="user-group"
                  iconStyle="solid"
                  size={18}
                  color={colors.tactileMomentumSecondary}
                />
              </View>
              <TextElement variant="subtitle" style={styles.featureText}>
                Push friends forward and share your wins
              </TextElement>
            </View>
          </AnimatedFeatureRow>

          <AnimatedFeatureRow delay={180}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Icon set="fa6" name="bell" size={18} color={colors.tactileMomentumSecondary} />
              </View>
              <TextElement variant="subtitle" style={styles.featureText}>
                Know the moment a push lands
              </TextElement>
            </View>
          </AnimatedFeatureRow>
        </View>
      </Column>

      <View style={styles.buttonContainer}>
        <Pressable
          accessibilityRole="button"
          disabled={loginLoading}
          onPress={() => handleLogin('google')}
          style={({ pressed }) => [
            styles.socialButton,
            styles.googleButton,
            pressed && !loginLoading && styles.buttonPressed,
          ]}
        >
          {signingInProvider === 'google' ? (
            <>
              <ActivityIndicator size="small" color={colors.tactileMomentumSecondary} />
              <Text style={styles.googleButtonText}>Signing in...</Text>
            </>
          ) : (
            <>
              <GoogleLogo size={moderateScale(18)} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        {appleSignInSupported ? (
          <Pressable
            accessibilityRole="button"
            disabled={loginLoading}
            onPress={() => handleLogin('apple')}
            style={({ pressed }) => [
              styles.socialButton,
              styles.appleButton,
              pressed && !loginLoading && styles.buttonPressed,
            ]}
          >
            {signingInProvider === 'apple' ? (
              <>
                <ActivityIndicator size="small" color={colors.onPrimary} />
                <Text style={styles.appleButtonText}>Signing in...</Text>
              </>
            ) : (
              <>
                <Icon set="fa6" name="apple" iconStyle="brand" size={20} color={colors.onPrimary} />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </>
            )}
          </Pressable>
        ) : null}

        <TextElement variant="caption" color="muted" style={styles.permissionText}>
          We&apos;ll never post without your permission.
        </TextElement>
      </View>

      <Height size={20} />
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      paddingTop: verticalScale(18),
    },
    tagline: {
      fontSize: moderateScale(17),
      lineHeight: moderateScale(24),
      color: colors.muted,
      marginBottom: 0,
    },
    titleBlock: {
      marginBottom: verticalScale(5),
    },
    titleLine: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: moderateScale(8),
    },
    titleText: {
      textAlign: 'left',
      fontWeight: '800',
      fontSize: moderateScale(35),
      lineHeight: moderateScale(38),
      color: colors.onboardingInk,
    },
    highlightedWord: {
      position: 'relative',
    },
    titleUnderline: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: moderateScale(2),
      height: moderateScale(15),
      backgroundColor: colors.onboardingPush,
    },
    featuresContainer: {
      marginTop: verticalScale(20),
      gap: verticalScale(20),
      width: '100%',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(18),
    },
    featureIcon: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(14),
      backgroundColor: colors.tactileMomentumPrimary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      color: colors.onboardingInk,
      fontSize: moderateScale(18),
      lineHeight: moderateScale(24),
      fontWeight: '600',
      flex: 1,
      flexShrink: 1,
    },
    buttonContainer: {
      width: '100%',
      paddingHorizontal: moderateScale(12),
    },
    socialButton: {
      minHeight: verticalScale(45),
      borderRadius: moderateScale(18),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: moderateScale(12),
    },
    googleButton: {
      backgroundColor: colors.onPrimary,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      marginBottom: verticalScale(12),
    },
    buttonPressed: {
      opacity: 0.82,
    },
    googleButtonText: {
      color: colors.tactileMomentumSecondary,
      fontSize: moderateScale(16),
      lineHeight: moderateScale(22),
      fontWeight: '700',
    },
    appleButton: {
      backgroundColor: colors.inkSurface,
    },
    appleButtonText: {
      color: colors.onPrimary,
      fontSize: moderateScale(16),
      lineHeight: moderateScale(22),
      fontWeight: '700',
    },
    permissionText: {
      textAlign: 'center',
      fontSize: moderateScale(12),
      lineHeight: moderateScale(18),
      marginTop: verticalScale(10),
    },
  });
