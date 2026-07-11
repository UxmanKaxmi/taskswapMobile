import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView as RNScrollView,
  StyleSheet,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Layout } from '@shared/components/Layout';
import PushButton from '@shared/components/PushButton';
import PushTicks from '@shared/components/PushTicks/PushTicks';
import TextElement from '@shared/components/TextElement/TextElement';
import LiveSupportBanner from '@features/Auth/components/LiveSupportBanner';
import { platformShadow, spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { isPROD } from '@shared/utils/constants';
import { ms, vs } from 'react-native-size-matters';
import HomeHeader from '@features/Home/components/HomeHeader';

const { width, height } = Dimensions.get('window');
const SCREEN_HORIZONTAL_PADDING = ms(28);
const SLIDE_WIDTH = width;
const HERO_HEIGHT = Math.min(330, height * 0.25);

type IntroContent = {
  heading: string;
  headingAccent: string;
  subtitle: string;
  prompt: string;
  feeling: string;
  responseMode: 'sentence' | 'momentum' | 'done';
  pushCount?: number;
};

const introExamples: IntroContent[] = [
  {
    heading: 'Say it',
    headingAccent: 'out loud.',
    subtitle: 'Post the thing you keep putting off. One honest sentence is enough.',
    prompt: 'Go for my first run in three weeks',
    feeling: 'Avoiding it',
    responseMode: 'sentence',
  },
  {
    heading: 'Strangers',
    headingAccent: 'push you.',
    subtitle: 'Every push is a real person rooting for you. Watch the momentum build.',
    prompt: 'Go for my first run in three weeks',
    feeling: 'Needs a push',
    responseMode: 'momentum',
    pushCount: 25,
  },
  {
    heading: 'Take the win.',
    headingAccent: 'Pass it on.',
    subtitle: 'Mark it done, feel the momentum — then push someone else forward.',
    prompt: 'Go for my first run in three weeks',
    feeling: 'Momentum built',
    responseMode: 'done',
    pushCount: 9,
  },
];

const IntroScreen = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideHeight, setSlideHeight] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<RNScrollView | null>(null);
  const isLastSlide = currentIndex === introExamples.length - 1;
  const [isActive, setIsActive] = useState(false);
  const handleStart = async () => {
    if (isPROD) {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } else {
      await AsyncStorage.removeItem('hasSeenOnboarding');
    }

    navigation.push('AddGoalScreen', {
      screen: 'AddMotivation',
    });
  };

  const handleSkip = async () => {
    if (isPROD) {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } else {
      await AsyncStorage.removeItem('hasSeenOnboarding');
    }

    navigation.replace('App');
  };

  const handleNext = () => {
    if (isLastSlide) {
      void handleStart();
      return;
    }

    goToSlide(currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    scrollRef.current?.scrollTo({ x: index * SLIDE_WIDTH, animated: true });
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SLIDE_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(introExamples.length - 1, nextIndex)));
  };
  const renderSlide = (example: IntroContent) => {
    return (
      <View
        style={[styles.slide, slideHeight > 0 && { height: slideHeight }]}
        key={example.heading}
      >
        <View style={styles.slideContent}>
          <View style={[styles.hero, example.responseMode === 'done' && styles.doneHero]}>
            {example.responseMode === 'sentence' && (
              <View style={[styles.demoCard, styles.sayCard]}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <TextElement variant="tiny" weight="700" style={styles.avatarText}>
                      You
                    </TextElement>
                  </View>

                  <View>
                    <TextElement variant="bodySmall" weight="700" style={styles.cardName}>
                      You
                    </TextElement>
                    <TextElement variant="label" weight="500" style={styles.cardMeta}>
                      Just now
                    </TextElement>
                  </View>

                  <View style={styles.feelingPill}>
                    <TextElement variant="tiny" weight="600" style={styles.feelingText}>
                      {example.feeling}
                    </TextElement>
                  </View>
                </View>

                <TextElement variant="bodySmall" weight="600" style={styles.promptText}>
                  {example.prompt}
                </TextElement>
              </View>
            )}

            {example.responseMode === 'momentum' && (
              <View style={[styles.demoCard, styles.pushDemoCard]}>
                <TextElement variant="bodySmall" weight="700" style={styles.promptTextCompact}>
                  {example.prompt}
                </TextElement>

                <View style={styles.responseBody}>
                  <View style={styles.ticksWrap}>
                    <PushTicks
                      count={example.pushCount ?? 0}
                      isActive={currentIndex === 1}
                      animateNonce={currentIndex}
                      showCount
                    />
                  </View>

                  <PushButton
                    onPress={() => setIsActive(true)}
                    label="Push"
                    size="sm"
                    variant="push"
                    style={styles.pushButton}
                    active={isActive}
                    textStyle={{ fontSize: ms(16) }}
                  />

                  {/* <PushButton
                    onPress={() => {}}
                    label="Push"
                    size="sm"
                    variant="push"
                    style={styles.pushButton}
                  /> */}
                </View>
              </View>
            )}

            {example.responseMode === 'done' && (
              <View style={styles.doneVisual}>
                <View style={[styles.demoCard, styles.completedCard]}>
                  <TextElement variant="bodySmall" weight="700" style={styles.completedGoalText}>
                    {example.prompt}
                  </TextElement>

                  <View style={styles.completedMetaRow}>
                    <View style={styles.doneChip}>
                      <TextElement variant="caption" weight="700" style={styles.doneChipText}>
                        Done ✓
                      </TextElement>
                    </View>

                    <TextElement variant="label" weight="600" style={styles.pushedByText}>
                      {example.pushCount} people pushed you
                    </TextElement>
                  </View>
                </View>

                <View style={[styles.demoCard, styles.nextGoalCard]}>
                  <View style={styles.nextGoalCopy}>
                    <TextElement variant="overline" weight="700" style={styles.nextGoalLabel}>
                      Someone else needs a push
                    </TextElement>
                    <TextElement variant="caption" weight="700" style={styles.nextGoalText}>
                      Send the email I've been avoiding
                    </TextElement>
                  </View>

                  <PushButton
                    onPress={() => {}}
                    label="Push"
                    size="sm"
                    variant="push"
                    style={styles.miniPushButton}
                    textStyle={{ fontSize: ms(16) }}
                  />
                </View>
              </View>
            )}
          </View>

          <View
            style={[
              styles.headlineWrap,
              example.responseMode === 'done' && styles.doneHeadlineWrap,
            ]}
          >
            <TextElement variant="display" weight="800" style={styles.headlineLine}>
              {example.heading}
            </TextElement>
            <View style={styles.headlineAccentWrap}>
              <View style={styles.headlineUnderline} />
              <TextElement variant="display" weight="800" style={styles.headlineAccent}>
                {example.headingAccent}
              </TextElement>
            </View>
          </View>

          <TextElement
            variant="bodySmall"
            style={[styles.subtitle, example.responseMode === 'done' && styles.doneSubtitle]}
          >
            {example.subtitle}
          </TextElement>
        </View>
      </View>
    );
  };

  const getDotAnimatedStyle = (index: number) => {
    const inputRange = introExamples.map((_, slideIndex) => slideIndex * SLIDE_WIDTH);

    return {
      width: scrollX.interpolate({
        inputRange,
        outputRange: introExamples.map((_, slideIndex) => (slideIndex === index ? ms(20) : ms(6))),
        extrapolate: 'clamp',
      }),
      backgroundColor: scrollX.interpolate({
        inputRange,
        outputRange: introExamples.map((_, slideIndex) =>
          slideIndex === index ? colors.onboardingInk : colors.onboardingLine,
        ),
        extrapolate: 'clamp',
      }),
    };
  };

  return (
    <Layout
      allowPaddingHorizontal={false}
      allowPaddingVertical={false}
      useSafeArea={false}
      style={styles.layout}
      backgroundColor={colors.onboardingPaper}
    >
      <View style={styles.screen}>
        <View style={styles.homeHeaderWrap}>
          <HomeHeader
            rightAccessory={
              <Pressable hitSlop={12} onPress={() => void handleSkip()} style={styles.skipButton}>
                <TextElement variant="label" weight="600" style={styles.skipText}>
                  Skip
                </TextElement>
              </Pressable>
            }
          />
        </View>

        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.slideWindow}
          contentContainerStyle={styles.slideTrack}
          onLayout={event => setSlideHeight(Math.round(event.nativeEvent.layout.height))}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
        >
          {introExamples.map(renderSlide)}
        </Animated.ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.dots}>
              {introExamples.map((_, index) => (
                <Pressable
                  key={index}
                  accessibilityRole="button"
                  accessibilityLabel={`Go to onboarding slide ${index + 1}`}
                  hitSlop={10}
                  onPress={() => goToSlide(index)}
                >
                  <Animated.View style={[styles.dot, getDotAnimatedStyle(index)]} />
                </Pressable>
              ))}
            </View>

            <PushButton
              onPress={handleNext}
              label={isLastSlide ? 'Get started' : 'Next'}
              size="sm"
              variant="push"
              style={styles.nextButton}
              textStyle={{ fontSize: ms(16) }}
            />
          </View>

          <LiveSupportBanner totalLabel="2,400+" />
        </View>
      </View>
    </Layout>
  );
};

export default IntroScreen;

const demoCardShadow = (colors: ThemeColors) =>
  platformShadow({
    color: colors.onboardingInk,
    opacity: 0.06,
    radius: 24,
    offset: { width: 0, height: 8 },
  });
const nextGoalCardShadow = (colors: ThemeColors) =>
  platformShadow({
    color: colors.onboardingInk,
    opacity: 0.03,
    radius: 10,
    offset: { width: 0, height: 3 },
  });

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    layout: {
      backgroundColor: colors.onboardingPaper,
    },
    screen: {
      flex: 1,
      paddingBottom: vs(34),
    },
    homeHeaderWrap: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    skipButton: {
      width: ms(56),
      alignItems: 'flex-end',
    },
    skipText: {
      color: colors.onboardingMuted,
      fontSize: ms(16),
    },
    slideWindow: {
      flex: 1,
      overflow: 'hidden',
    },
    slideTrack: {
      alignItems: 'stretch',
    },
    slide: {
      width: SLIDE_WIDTH,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: vs(12),
    },
    slideContent: {
      width: '100%',
      paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    },
    hero: {
      width: '100%',
      minHeight: HERO_HEIGHT,
      justifyContent: 'center',
    },
    doneHero: {
      minHeight: HERO_HEIGHT - vs(18),
      justifyContent: 'flex-start',
      paddingTop: vs(8),
    },
    demoCard: {
      backgroundColor: colors.onboardingCard,
      borderRadius: 18,
      paddingHorizontal: ms(16),
      paddingVertical: vs(16),
      ...demoCardShadow(colors),
    },
    sayCard: {
      width: '100%',
      transform: [{ rotate: '-1.5deg' }],
    },
    pushDemoCard: {
      width: '100%',
      transform: [{ rotate: '1deg' }],
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
    },
    avatar: {
      width: ms(38),
      height: ms(38),
      borderRadius: ms(19),
      backgroundColor: colors.onboardingPush,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: colors.tactileMomentumSecondary,
    },
    cardName: {
      color: colors.onboardingInk,
      fontSize: ms(14),
      lineHeight: ms(18),
    },
    cardMeta: {
      color: colors.onboardingMuted,
      fontSize: ms(12),
      lineHeight: ms(15),
    },
    feelingPill: {
      marginLeft: 'auto',
      backgroundColor: colors.onboardingPaper,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      paddingVertical: vs(4),
      paddingHorizontal: ms(9),
      borderRadius: 999,
    },
    feelingText: {
      color: colors.onboardingInkSoft,
      fontSize: ms(10.5),
    },
    promptText: {
      marginTop: vs(10),
      color: colors.onboardingInk,
      fontSize: ms(16.5),
      lineHeight: ms(23),
      letterSpacing: -0.2,
    },
    promptTextCompact: {
      color: colors.onboardingInk,
      fontSize: ms(15),
      lineHeight: ms(21),
      letterSpacing: -0.15,
    },
    responseBody: {
      marginTop: vs(14),
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: ms(12),
    },
    ticksWrap: {
      flex: 1,
    },
    pushButton: {
      minWidth: ms(88),
      alignSelf: 'flex-start',
    },
    doneVisual: {
      width: '100%',
      alignItems: 'center',
      gap: vs(16),
      marginTop: vs(-6),
      paddingBottom: vs(6),
    },
    completedCard: {
      width: '100%',
      gap: vs(12),
    },
    completedGoalText: {
      color: colors.onboardingInk,
      fontSize: ms(16),
      lineHeight: ms(22),
      letterSpacing: -0.15,
    },
    completedMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: ms(10),
    },
    doneChip: {
      backgroundColor: colors.onboardingDone,
      borderRadius: 999,
      paddingVertical: vs(8),
      paddingHorizontal: ms(18),
    },
    doneChipText: {
      color: colors.onboardingCard,
      fontSize: ms(13),
    },
    pushedByText: {
      color: colors.onboardingMuted,
      flexShrink: 1,
      textAlign: 'right',
    },
    nextGoalCard: {
      width: '84%',
      alignSelf: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
      paddingVertical: vs(10),
      paddingHorizontal: ms(14),
      marginLeft: ms(20),
      backgroundColor: colors.onboardingCard,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      ...nextGoalCardShadow(colors),
      transform: [{ translateX: ms(10) }, { rotate: '1deg' }],
    },
    nextGoalCopy: {
      flex: 1,
    },
    nextGoalLabel: {
      color: colors.onboardingMuted,
      letterSpacing: 0.5,
    },
    nextGoalText: {
      color: colors.onboardingInkSoft,
      marginTop: vs(3),
      fontSize: ms(12.5),
      lineHeight: ms(16),
    },
    miniPushButton: {
      minWidth: ms(74),
      alignSelf: 'flex-start',
    },
    headlineWrap: {
      alignItems: 'flex-start',
      width: '100%',
      marginTop: vs(4),
    },
    doneHeadlineWrap: {
      marginTop: vs(28),
    },
    headlineLine: {
      color: colors.onboardingInk,
      fontSize: ms(40),
      lineHeight: ms(42),
      letterSpacing: -1.2,
    },
    headlineAccent: {
      color: colors.onboardingInk,
      fontSize: ms(40),
      lineHeight: ms(42),
      letterSpacing: -1.2,
    },
    headlineAccentWrap: {
      alignSelf: 'flex-start',
      position: 'relative',
    },
    headlineUnderline: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: vs(2),
      height: vs(8),
      backgroundColor: colors.onboardingPush,
    },
    subtitle: {
      marginTop: vs(12),
      marginBottom: vs(12),
      color: colors.onboardingMuted,
      fontSize: ms(15),
      lineHeight: ms(23),
    },
    doneSubtitle: {
      marginTop: vs(10),
    },
    footer: {
      paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
      paddingTop: vs(6),
      gap: vs(14),
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dots: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(6),
    },
    dot: {
      width: ms(6),
      height: ms(6),
      borderRadius: 999,
      backgroundColor: colors.onboardingLine,
    },
    nextButton: {
      minWidth: ms(96),
      alignSelf: 'flex-end',
    },
  });
