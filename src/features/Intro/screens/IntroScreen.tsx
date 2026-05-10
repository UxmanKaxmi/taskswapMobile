import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, Pressable, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Layout } from '@shared/components/Layout';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import TextElement from '@shared/components/TextElement/TextElement';
import { Icon } from '@shared/components/Icons';
import Avatar from '@shared/components/Avatar/Avatar';
import { colors, spacing } from '@shared/theme';
import { isPROD } from '@shared/utils/constants';
import { ms, vs } from 'react-native-size-matters';
import LiveSupportBanner from '@features/Auth/components/LiveSupportBanner';

const { height } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(330, height * 0.3);

type IntroContent = {
  promptAuthor: string;
  promptAuthorTint: string;
  promptAuthorText: string;
  prompt: string;
  responseAuthor: string;
  responseRole: string;
  responseAuthorTint: string;
  responseAuthorText: string;
  response: string;
  responseIcon?: {
    set: 'ion';
    name: string;
    color: string;
  };
};

const introExamples: IntroContent[] = [
  {
    promptAuthor: 'ME',
    promptAuthorTint: colors.reminderBg,
    promptAuthorText: colors.reminderBgHardest,
    prompt: 'I need motivation for my workout',
    responseAuthor: 'ALEX',
    responseRole: 'Trusted friend',
    responseAuthorTint: colors.adviceBg,
    responseAuthorText: colors.calmBlue,
    response: "You've got this! Show up for 10 minutes today.",
    responseIcon: {
      set: 'ion',
      name: 'flash',
      color: colors.secondary,
    },
  },
  {
    promptAuthor: 'ME',
    promptAuthorTint: colors.reminderBg,
    promptAuthorText: colors.reminderBgHardest,
    prompt: 'Should I text her back right now?',
    responseAuthor: 'MAYA',
    responseRole: 'Close friend',
    responseAuthorTint: colors.adviceBg,
    responseAuthorText: colors.calmBlue,
    response: 'Yes, send it simply and do not overthink it.',
    responseIcon: {
      set: 'ion',
      name: 'chatbubble-ellipses',
      color: colors.secondary,
    },
  },
  {
    promptAuthor: 'ME',
    promptAuthorTint: colors.reminderBg,
    promptAuthorText: colors.reminderBgHardest,
    prompt: 'Remind me to call my dad tonight',
    responseAuthor: 'SAM',
    responseRole: 'Trusted friend',
    responseAuthorTint: colors.adviceBg,
    responseAuthorText: colors.calmBlue,
    response: 'Done. You are calling him tonight, no excuses.',
    responseIcon: {
      set: 'ion',
      name: 'alarm',
      color: colors.secondary,
    },
  },
  {
    promptAuthor: 'ME',
    promptAuthorTint: colors.reminderBg,
    promptAuthorText: colors.reminderBgHardest,
    prompt: 'Which offer should I accept this week?',
    responseAuthor: 'ZARA',
    responseRole: 'Trusted friend',
    responseAuthorTint: colors.adviceBg,
    responseAuthorText: colors.calmBlue,
    response: 'Pick the one with better growth and momentum.',
    responseIcon: {
      set: 'ion',
      name: 'checkmark-circle',
      color: colors.secondary,
    },
  },
];

const IntroScreen = ({ navigation }: { navigation: any }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const promptCardOpacity = useRef(new Animated.Value(0)).current;
  const promptCardTranslateY = useRef(new Animated.Value(-10)).current;

  const promptHeaderOpacity = useRef(new Animated.Value(0)).current;
  const promptHeaderTranslateY = useRef(new Animated.Value(-4)).current;
  const promptTextOpacity = useRef(new Animated.Value(0)).current;
  const promptTextTranslateY = useRef(new Animated.Value(6)).current;

  const responseCardOpacity = useRef(new Animated.Value(0)).current;
  const responseCardTranslateY = useRef(new Animated.Value(18)).current;
  const responseCardScale = useRef(new Animated.Value(0.96)).current;

  const responseHeaderOpacity = useRef(new Animated.Value(0)).current;
  const responseHeaderTranslateY = useRef(new Animated.Value(6)).current;
  const responseTextOpacity = useRef(new Animated.Value(0)).current;
  const responseTextTranslateY = useRef(new Animated.Value(8)).current;

  const copyOpacity = useRef(new Animated.Value(0)).current;
  const copyTranslateY = useRef(new Animated.Value(12)).current;

  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const firstRunRef = useRef(true);

  const currentExample = introExamples[currentIndex];

  const resetBubbleAnimatedValues = () => {
    promptCardOpacity.setValue(0);
    promptCardTranslateY.setValue(-10);

    promptHeaderOpacity.setValue(0);
    promptHeaderTranslateY.setValue(-4);
    promptTextOpacity.setValue(0);
    promptTextTranslateY.setValue(6);

    responseCardOpacity.setValue(0);
    responseCardTranslateY.setValue(18);
    responseCardScale.setValue(0.96);

    responseHeaderOpacity.setValue(0);
    responseHeaderTranslateY.setValue(6);
    responseTextOpacity.setValue(0);
    responseTextTranslateY.setValue(8);
  };

  const playBubbleSequence = () => {
    resetBubbleAnimatedValues();

    const sequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(promptCardOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(promptCardTranslateY, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(promptHeaderOpacity, {
          toValue: 1,
          duration: 170,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(promptHeaderTranslateY, {
          toValue: 0,
          duration: 170,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(promptTextOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(promptTextTranslateY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(responseCardOpacity, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(responseCardTranslateY, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(responseCardScale, {
          toValue: 1,
          tension: 90,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(responseHeaderOpacity, {
          toValue: 1,
          duration: 170,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(responseHeaderTranslateY, {
          toValue: 0,
          duration: 170,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(responseTextOpacity, {
          toValue: 1,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(responseTextTranslateY, {
          toValue: 0,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(2200),

      Animated.parallel([
        Animated.timing(promptCardOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(promptCardTranslateY, {
          toValue: -8,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(promptHeaderOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(promptTextOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),

        Animated.timing(responseCardOpacity, {
          toValue: 0,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(responseCardTranslateY, {
          toValue: 16,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(responseHeaderOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(responseTextOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]),
    ]);

    loopRef.current = sequence;
    sequence.start(({ finished }) => {
      if (!finished || !mountedRef.current) return;

      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setCurrentIndex(prev => (prev + 1) % introExamples.length);
      }, 300);
    });
  };

  useEffect(() => {
    mountedRef.current = true;

    Animated.parallel([
      Animated.timing(copyOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(copyTranslateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      mountedRef.current = false;
      loopRef.current?.stop?.();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [copyOpacity, copyTranslateY]);

  useEffect(() => {
    if (!mountedRef.current) return;

    if (firstRunRef.current) {
      firstRunRef.current = false;
    }

    playBubbleSequence();

    return () => {
      loopRef.current?.stop?.();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex]);

  const handleStart = async () => {
    if (isPROD) {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } else {
      await AsyncStorage.removeItem('hasSeenOnboarding');
    }

    navigation.push('AddTaskScreen', {
      screen: 'ChooseImpactScreen',
      params: { entry: 'intro' },
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

  return (
    <Layout
      allowPaddingHorizontal={false}
      style={styles.layout}
      backgroundColor={colors.surface}
      edgesProp={['top', 'left', 'right']}
    >
      <View style={styles.screen}>
        <View style={styles.topRow}>
          <Pressable hitSlop={12} onPress={() => void handleSkip()} style={styles.skipButton}>
            <TextElement variant="label" weight="600" style={styles.skipText}>
              Skip
            </TextElement>
          </Pressable>
        </View>

        <View style={styles.slide}>
          <View style={styles.hero}>
            <Animated.View
              style={[
                styles.promptCard,
                {
                  opacity: promptCardOpacity,
                  transform: [{ translateY: promptCardTranslateY }],
                },
              ]}
            >
              <Animated.View
                style={{
                  opacity: promptHeaderOpacity,
                  transform: [{ translateY: promptHeaderTranslateY }],
                }}
              >
                <View style={styles.cardHeader}>
                  <Avatar
                    size={ms(30)}
                    fallback={currentExample.promptAuthor.charAt(0)}
                    borderColor={colors.surface}
                    fallbackStyle={{ backgroundColor: currentExample.promptAuthorTint }}
                    textStyle={{ color: currentExample.promptAuthorText }}
                  />

                  <TextElement variant="overline" weight="700" style={styles.promptAuthorText}>
                    {currentExample.promptAuthor}
                  </TextElement>
                </View>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: promptTextOpacity,
                  transform: [{ translateY: promptTextTranslateY }],
                }}
              >
                <TextElement variant="bodySmall" weight="600" style={styles.promptText}>
                  {currentExample.prompt}
                </TextElement>
              </Animated.View>
            </Animated.View>

            <Animated.View
              style={[
                styles.responseCard,
                {
                  opacity: responseCardOpacity,
                  transform: [{ translateY: responseCardTranslateY }, { scale: responseCardScale }],
                },
              ]}
            >
              <Animated.View
                style={{
                  opacity: responseHeaderOpacity,
                  transform: [{ translateY: responseHeaderTranslateY }],
                }}
              >
                <View style={styles.cardHeader}>
                  <Avatar
                    size={ms(30)}
                    fallback={currentExample.responseAuthor.charAt(0)}
                    borderColor={colors.surface}
                    fallbackStyle={{ backgroundColor: currentExample.responseAuthorTint }}
                    textStyle={{ color: currentExample.responseAuthorText }}
                  />

                  <View style={styles.responseHeaderText}>
                    <TextElement variant="label" weight="700" style={styles.responseAuthorText}>
                      {currentExample.responseAuthor}
                    </TextElement>
                    <TextElement variant="caption" weight="500" style={styles.responseRoleText}>
                      {currentExample.responseRole}
                    </TextElement>
                  </View>
                </View>
              </Animated.View>

              <Animated.View
                style={{
                  opacity: responseTextOpacity,
                  transform: [{ translateY: responseTextTranslateY }],
                }}
              >
                <View style={styles.responseBody}>
                  <TextElement variant="bodySmall" weight="700" style={styles.responseText}>
                    {currentExample.response}{' '}
                    {currentExample.responseIcon ? (
                      <Icon
                        set={currentExample.responseIcon.set}
                        name={currentExample.responseIcon.name}
                        size={ms(18)}
                        color={currentExample.responseIcon.color}
                      />
                    ) : null}
                  </TextElement>
                </View>
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.copyBlock,
              {
                opacity: copyOpacity,
                transform: [{ translateY: copyTranslateY }],
              },
            ]}
          >
            <View style={styles.headlineWrap}>
              <TextElement variant="headline" weight="700" style={styles.headlineLine}>
                Get the right
              </TextElement>

              <View style={styles.headlineRow}>
                <TextElement variant="headline" weight="700" style={styles.headlineLine}>
                  push to{' '}
                </TextElement>
                <TextElement variant="headline" weight="700" style={styles.headlineAccent}>
                  move
                </TextElement>
              </View>

              <TextElement variant="headline" weight="700" style={styles.headlineAccent}>
                forward.
              </TextElement>
            </View>

            <TextElement variant="body" color="muted" style={styles.subtitle}>
              Ask for motivation, advice, decisions, or reminders from people you trust.
            </TextElement>
          </Animated.View>
        </View>
        <PrimaryButton
          title="Get started"
          onPress={() => void handleStart()}
          style={styles.ctaButton}
        />
        <LiveSupportBanner />
      </View>
    </Layout>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  layout: {
    backgroundColor: colors.surface,
  },
  screen: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(10),
    paddingBottom: vs(28),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: vs(18),
  },
  skipButton: {
    width: ms(56),
    alignItems: 'flex-end',
  },
  skipText: {
    color: colors.primary,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  hero: {
    width: '100%',
    minHeight: HERO_HEIGHT,
    justifyContent: 'flex-end',
    marginBottom: vs(28),
  },
  promptCard: {
    position: 'absolute',
    top: vs(25),
    right: 0,
    width: '76%',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: ms(16),
    paddingVertical: vs(14),
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    zIndex: 2,
  },
  responseCard: {
    width: '90%',
    alignSelf: 'flex-start',
    borderRadius: 24,
    paddingHorizontal: ms(18),
    paddingVertical: vs(16),
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  subtitle: {
    marginTop: vs(5),
    marginBottom: vs(12),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },
  promptAuthorText: {
    color: colors.muted,
    letterSpacing: 0.8,
  },
  responseHeaderText: {
    flex: 1,
  },
  responseAuthorText: {
    color: colors.onPrimary,
    letterSpacing: 1,
  },
  responseRoleText: {
    color: colors.gradientDarkPurple,
    marginTop: vs(-2),
  },
  promptText: {
    marginTop: vs(10),
    color: colors.text,
  },
  responseBody: {
    marginTop: vs(8),
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: ms(6),
  },
  responseText: {
    flex: 1,
    color: colors.onPrimary,
  },
  copyBlock: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: ms(4),
  },
  headlineWrap: {
    alignItems: 'flex-start',
    width: '100%',
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  headlineLine: {
    color: colors.text,
    textAlign: 'center',
  },
  headlineAccent: {
    fontStyle: 'italic',
    color: colors.primary,
    textAlign: 'center',
  },
  ctaButton: {},
});
