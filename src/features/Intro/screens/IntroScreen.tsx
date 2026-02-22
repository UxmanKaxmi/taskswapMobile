import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  TextStyle,
} from 'react-native';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { Layout } from '@shared/components/Layout';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import TextElement from '@shared/components/TextElement/TextElement';
import { Height } from '@shared/components/Spacing';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isDEV, isPROD } from '@shared/utils/constants';
import { colors, spacing } from '@shared/theme';
import AppLogo from '@shared/components/AppLogo/AppLogo';
import { ms, vs } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');
const subtitleBoldStyle: TextStyle = { fontWeight: '700' };

type IntroSlide = {
  image: any;
  title: string;
  subtitle: React.ReactNode;
};

const slides: IntroSlide[] = [
  {
    image: require('@assets/images/slider1.png'),
    title: 'You Don’t Have to Push Yourself Alone',
    subtitle: 'Share your goals with people you trust and get a gentle nudge when it gets hard.',
  },
  {
    image: require('@assets/images/slider2.png'),
    title: 'Choose The Kind Of Help You Need',
    subtitle: (
      <>
        Need a push, an opinion, or a nudge later? Choose{' '}
        <Text style={subtitleBoldStyle}>Motivation</Text>,{' '}
        <Text style={subtitleBoldStyle}>Advice</Text>,{' '}
        <Text style={subtitleBoldStyle}>Decision</Text>, or{' '}
        <Text style={subtitleBoldStyle}>Reminder</Text>.
      </>
    ),
  },
  {
    image: require('@assets/images/slider3.png'),
    title: 'Progress, One Day at a Time',
    subtitle: 'Track small wins, stay accountable, and keep going. No pressure, just progress.',
  },
];

const IntroScreen = ({ navigation }: { navigation: any }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const swiperRef = useRef<Swiper>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleStart = async () => {
    if (isDEV) {
      // Production mode — only show onboarding once
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } else {
      // Dev mode — always show onboarding for testing
      await AsyncStorage.removeItem('hasSeenOnboarding');
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('App');
    });
  };

  const handleButtonPress = () => {
    if (activeSlide < slides.length - 1) {
      swiperRef.current?.scrollBy(1);
      return;
    }

    void handleStart();
  };
  return (
    <Layout
      allowPaddingHorizontal={false}
      style={{
        backgroundColor: colors.onAccent,
      }}
    >
      <Animated.View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          top: height * 0.02,
          opacity: fadeAnim,
        }}
      >
        <View style={styles.logoWrapper}>
          {/* <TextElement variant="subtitle" marginVertical={5}>
            Welcome to
          </TextElement>{' '}
          <AppLogo size="lg" /> */}
          {/* <Image
            source={require('@assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          /> */}
        </View>
      </Animated.View>

      <Swiper
        ref={swiperRef}
        width={width}
        // autoplay
        loop={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        showsPagination
        onIndexChanged={setActiveSlide}
      >
        {slides.map((slide, index) => (
          <View key={index} style={styles.container}>
            <Image
              source={slide.image}
              style={index == 2 ? styles.image3 : styles.image}
              resizeMode="contain"
            />
            <TextElement variant="title" style={index == 2 ? styles.title3 : styles.title}>
              {slide.title}
            </TextElement>
            <TextElement variant="caption" style={styles.subtitle}>
              {slide.subtitle}
            </TextElement>
          </View>
        ))}
      </Swiper>

      <PrimaryButton
        onPress={handleButtonPress}
        style={styles.button}
        title={activeSlide < slides.length - 1 ? 'Next' : 'Get Started'}
      />
      <Height size={20} />
    </Layout>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.02,
  },

  logo: {
    width: width * 0.55,
    height: height * 0.15,
  },
  container: {
    flex: 1,
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  image: {
    height: height * 0.32,
    width: width * 2,
  },
  image3: {
    height: height * 0.45,
    width: width * 2,
    marginTop: vs(-50),
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
    fontSize: ms(24),
    paddingHorizontal: ms(20),
  },
  title3: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 32,
    fontSize: ms(24),
    marginTop: vs(-40),
    paddingHorizontal: ms(20),
  },
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    // paddingHorizontal: 10,
    marginBottom: 40,
    fontSize: ms(15),
  },
  button: {
    // flexDirection: 'row',
    backgroundColor: colors.motivationPurple,
    // paddingVertical: 14,
    marginHorizontal: spacing.md,
    // borderRadius: 16,
    // alignItems: 'center',
    // justifyContent: 'space-between',
    // width: 240,
    marginBottom: vs(22),
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  arrow: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  dot: {
    backgroundColor: '#E0E0E0',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 4,
  },
  activeDot: {
    backgroundColor: colors.motivationPurple,
    width: 10,
    height: 10,
    borderRadius: 5,
    margin: 4,
  },
});
