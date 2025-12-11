import React, { useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Layout } from '@shared/components/Layout';
import TextElement from '@shared/components/TextElement/TextElement';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import { Height } from '@shared/components/Spacing';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '@shared/theme';
import { AuthStackParamList } from '@navigation/types/navigation';
import { resetToHomeRoot, resetToStack } from '@navigation/types/navigationUtils';

const { width, height } = Dimensions.get('window');

export default function AuthIntroScreen() {
  const route = useRoute<RouteProp<AuthStackParamList, 'AuthIntro'>>();

  const redirectTo = route.params?.redirectTo;
  const redirectParams = route.params?.params;
  const navigation = useNavigation();

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
    resetToHomeRoot(navigation);
  };

  return (
    <Animated.View style={{ flex: 1 }}>
      <Layout>
        {/* <View style={styles.logoWrapper}>
          <Image
            source={require('@assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View> */}

        <View style={styles.container}>
          <Image
            source={require('@assets/images/loginImage5.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <TextElement marginVertical={18} variant="title" style={styles.title}>
            Log in to Continue
          </TextElement>

          <TextElement variant="caption" style={styles.subtitle}>
            Unlock all features — add tasks, follow friends, track your journey, and stay motivated
            every day.
          </TextElement>
        </View>

        <PrimaryButton title="Login" onPress={handleContinue} />
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
    height: height * 0.3,
    marginBottom: 20,
  },
  title: {
    marginBottom: 10,
    fontWeight: '700',
    textAlign: 'center',
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
