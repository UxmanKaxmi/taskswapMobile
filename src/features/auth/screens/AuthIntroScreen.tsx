import React, { useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { Height } from '@shared/components/Spacing';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '@shared/theme';
import { MainStackParamList } from '@navigation/types/navigation';
import { resetToHomeRoot, resetToStack } from '@navigation/types/navigationUtils';
import { vs } from 'react-native-size-matters';

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
  AddTask: {
    title: 'Create Your Task',
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
    title: 'See What’s New',
    subtitle: 'Log in to view updates, responses, and gentle nudges meant for you.',
    cta: 'Log In to View',
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

  Advice: {
    title: 'Log In to Suggest Advice',
    subtitle: 'Log in to share your advice and return right where you left off.',
    cta: 'Log In to Send',
  },

  Reminder: {
    title: 'Log In to Send a Reminder',
    subtitle: 'Log in to set a reminder and get updates when it’s done.',
    cta: 'Log In to Remind',
  },

  Push: {
    title: 'Log In to Send a Push',
    subtitle: 'Log in to send a quick push of motivation. It only takes a second.',
    cta: 'Log In to Push',
  },

  Decision: {
    title: 'Log In to Help Them Decide',
    subtitle: 'Log in to vote or share input and help them move forward.',
    cta: 'Log In to Respond',
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
      title: 'Continue with Push Me Up',
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
      <Layout backgroundColor="onAccent">
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

          <TextElement marginVertical={18} variant="title" style={styles.title}>
            {copy.title}
          </TextElement>

          <TextElement variant="caption" style={styles.subtitle}>
            {copy.subtitle}
          </TextElement>
        </View>

        <PrimaryButton title={copy.cta} onPress={handleContinue} />
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
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  logo: {
    width: width * 0.45,
    height: height * 0.12,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width,
    height: height * 0.42,
    // marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: vs(-20),
  },
  subtitle: {
    color: '#707070',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  skipText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
});
