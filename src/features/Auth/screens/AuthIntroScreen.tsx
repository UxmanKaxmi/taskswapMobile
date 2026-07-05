import React from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PushButton from '@shared/components/PushButton';
import { Height } from '@shared/components/Spacing';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '@shared/theme';
import { MainStackParamList } from '@navigation/types/navigation';
import { resetToHomeRoot } from '@navigation/types/navigationUtils';
import { ms, vs } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');
const loginImage = require('@assets/images/loginImage5.png');

// Map of copy for different redirect screens
const authCopyMap: Record<
  string,
  {
    title: string;
    subtitle: string;
    cta: string;
  }
> = {
  AddGoal: {
    title: 'Create Your Goal',
    subtitle: 'Log in to create tasks, involve helpers, and keep everything in one place.',
    cta: 'Log In to Create',
  },

  Friends: {
    title: 'Stay Connected',
    subtitle:
      'Log in to follow friends, send support, and stay close to the people you care about.',
    cta: 'Log In to Connect',
  },

  FriendsProfileScreen: {
    title: 'Make Your Support Count',
    subtitle: 'Log in to send support and keep the connection meaningful.',
    cta: 'Log In to Help',
  },

  Notification: {
    title: 'Open Your Inbox',
    subtitle: 'Log in to view updates, responses, and gentle nudges meant for you.',
    cta: 'Log In to View Inbox',
  },

  Profile: {
    title: 'Your Space, Saved',
    subtitle: 'Log in to track progress, manage your activity, and stay connected.',
    cta: 'Log In & Continue',
  },

  Home: {
    title: 'Make Your Support Count',
    subtitle: 'Log in to support others, see your impact, and stay connected.',
    cta: 'Log In to Support',
  },

  Push: {
    title: 'Log In to Send a Push',
    subtitle: 'Log in to send a quick push of motivation. It only takes a second.',
    cta: 'Log In to Push',
  },

  guest_motivation: {
    title: 'Need a boost to move forward?',
    subtitle: 'Share a goal and let friends back you up.',
    cta: 'Log In to Push',
  },

  guest_accountability: {
    title: 'Keep momentum with support',
    subtitle: 'Check in and let friends keep you on track.',
    cta: 'Log In to Stay Accountable',
  },
};

export default function AuthIntroScreen() {
  const route = useRoute<RouteProp<MainStackParamList, 'AuthIntro'>>();

  const redirectTo = route.params?.redirectTo;
  const redirectParams = route.params?.params;
  const authContext = route.params?.authContext;
  const authCopy = route.params?.authCopy;
  const navigation = useNavigation();

  console.log('redirectTo', redirectTo);
  const copy = authCopy ||
    (authContext && authCopyMap[authContext]) ||
    (redirectTo && authCopyMap[redirectTo]) || {
      title: 'Continue with PushMeUp',
      subtitle: 'Log in to save your progress and stay connected.',
      cta: 'Log In',
    };

  const handleContinue = () => {
    navigation.navigate('Auth', {
      screen: 'Login',
      params: {
        redirectTo,
        params: redirectParams,
      },
    });
  };

  const handleSkip = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      resetToHomeRoot(navigation);
    }
  };

  return (
    <Animated.View style={{ flex: 1 }}>
      <Layout backgroundColor={colors.onboardingPaper}>
        {/* <View style={styles.logoWrapper}>
          <Image
            source={require('@assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View> */}

        <View style={styles.container}>
          <Image
            source={loginImage}
            style={styles.image}
            resizeMode="contain"
            fadeDuration={0}
            defaultSource={loginImage}
          />

          <TextElement variant="title" style={styles.title}>
            {copy.title}
          </TextElement>

          <TextElement variant="caption" style={styles.subtitle}>
            {copy.subtitle}
          </TextElement>
        </View>

        <PushButton
          label={copy.cta}
          variant="push"
          size="lg"
          hideIcon
          style={styles.ctaButton}
          onPress={handleContinue}
          textStyle={{ fontWeight: '800', fontSize: ms(16) }}
        />
        <Height size={10} />

        <TouchableOpacity onPress={handleSkip}>
          <TextElement style={styles.skipText}>Maybe Later</TextElement>
        </TouchableOpacity>

        <Height size={30} />
      </Layout>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ctaButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: vs(8),
  },
  image: {
    width: width,
    height: height * 0.4,
    // marginTop: vs(-18),
    // marginBottom: vs(2),
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    marginTop: vs(10),
    marginBottom: vs(10),
    fontSize: ms(30),
    // lineHeight: 24,
  },
  subtitle: {
    color: colors.onboardingMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  skipText: {
    textAlign: 'center',
    color: colors.onboardingInk,
    fontWeight: '600',
    fontSize: ms(14),
    marginTop: vs(7),
  },
});
