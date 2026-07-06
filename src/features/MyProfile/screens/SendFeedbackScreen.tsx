import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import Config from 'react-native-config';
import { ms, vs } from 'react-native-size-matters';

import { useAuth } from '@features/Auth/AuthProvider';
import { submitFeedback } from '../api/MyProfileAPI';
import { FeedbackCategory, FeedbackPayload } from '../types/feedback.types';
import { navigationRef } from '@navigation/navigationRef';
import { AppNavigationProp } from '@navigation/types/navigation';
import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Ripple from '@shared/components/Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import Layout from '@shared/components/Layout/Layout';
import Row from '@shared/components/Layout/Row';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import { showToast } from '@shared/utils/toast';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import Height from '@shared/components/Spacing/Height';
import AnimatedBottomButton from '@shared/components/Buttons/AnimatedBottomButton';
import { isIOS } from '@shared/utils/constants';

const FEEDBACK_CATEGORIES: Array<{ label: string; value: FeedbackCategory }> = [
  { label: 'Something is confusing', value: 'confusing' },
  { label: 'I found a bug', value: 'bug' },
  { label: 'I have an idea', value: 'idea' },
  { label: 'I liked something', value: 'positive' },
  { label: 'Other', value: 'other' },
];

export default function SendFeedbackScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<AppNavigationProp>();
  const { user } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory | undefined>();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentScreen = navigationRef.getCurrentRoute()?.name ?? 'SendFeedbackScreen';

  const deviceContext = useMemo(() => {
    const platformConstants = Platform.constants as Record<string, any>;
    const nativeConfig = Config as Record<string, string | undefined>;

    return {
      appVersion: nativeConfig.APP_VERSION || nativeConfig.VERSION || '0.0.1',
      platform: Platform.OS as FeedbackPayload['platform'],
      osVersion: String(Platform.Version),
      device:
        platformConstants.Model ||
        platformConstants.model ||
        platformConstants.Brand ||
        platformConstants.brand ||
        Platform.OS,
      currentScreen,
      loggedInUserId: user?.id,
    };
  }, [currentScreen, user?.id]);

  const feedbackMutation = useMutation({
    mutationFn: (payload: FeedbackPayload) => submitFeedback(payload),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      showToast({
        type: 'error',
        title: 'Could not send feedback',
        message: 'Please try again in a moment.',
      });
    },
  });

  useEffect(() => {
    if (!submitted) return undefined;

    const timeout = setTimeout(() => {
      navigation.goBack();
    }, 1400);

    return () => clearTimeout(timeout);
  }, [navigation, submitted]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || feedbackMutation.isPending) return;

    feedbackMutation.mutate({
      category,
      message: trimmedMessage,
      ...deviceContext,
      timeSubmitted: new Date().toISOString(),
    });
  };

  return (
    <Layout
      footerContent={
        //  <PrimaryButton
        //         title="Send Feedback"
        //         onPress={handleSubmit}
        //         isLoading={feedbackMutation.isPending}
        //         disabled={!message.trim()}
        //         backgroundColor={colors.onboardingInk}
        //         style={styles.cta}
        //       />
        <AnimatedBottomButton
          style={{
            marginBottom: isIOS ? vs(12) : vs(5),
          }}
          visible={!!message.trim()}
          title={'Send Feedback'}
          onPress={handleSubmit}
          buttonColor={colors.onboardingPush}
          textColor={colors.tactileMomentumSecondary}
        />
      }
      scrollable
      allowPaddingVertical={false}
      backgroundColor={colors.onboardingPaper}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.content}>
          {/* <Row align="center" style={styles.header}>
            <Ripple style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon set="ion" name="chevron-back" size={22} color={colors.onboardingInk} />
            </Ripple>
            <TextElement style={styles.headerTitle}>Send Feedback</TextElement>
          </Row> */}
          <AppHeader title="" showNavigation={true} />
          <Height size={spacing.md} />

          {submitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <Icon set="ion" name="checkmark" size={26} color={colors.onboardingInk} />
              </View>
              <TextElement style={styles.successText}>
                Thank you — this helps us make PushMeUp better.
              </TextElement>
            </View>
          ) : (
            <>
              <View style={styles.copyBlock}>
                <TextElement style={styles.title}>Help us make PushMeUp better</TextElement>
                <TextElement style={styles.subtitle}>
                  Tell us what felt useful, confusing, missing, or frustrating.
                </TextElement>
              </View>

              <View style={styles.chips}>
                {FEEDBACK_CATEGORIES.map(item => {
                  const selected = category === item.value;

                  return (
                    <Ripple
                      key={item.value}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => setCategory(selected ? undefined : item.value)}
                    >
                      <TextElement style={[styles.chipText, selected && styles.chipTextSelected]}>
                        {item.label}
                      </TextElement>
                    </Ripple>
                  );
                })}
              </View>

              <View style={styles.inputBlock}>
                <TextElement style={styles.inputLabel}>What would you like to share?</TextElement>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  textAlignVertical="top"
                  placeholder="Tell us what happened, what you expected, or what would make PushMeUp better."
                  placeholderTextColor={colors.placeHolder}
                  style={styles.textArea}
                />
              </View>
            </>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Layout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingTop: vs(10),
      paddingBottom: vs(28),
    },
    header: {
      // minHeight: vs(44),
      marginBottom: vs(15),
      // backgroundColor: 'red',
      justifyContent: 'flex-start',
    },
    backButton: {
      width: ms(42),
      height: ms(42),
      borderRadius: ms(21),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      marginRight: spacing.sm,
    },
    headerTitle: {
      fontSize: ms(20),
      lineHeight: ms(25),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    copyBlock: {
      marginBottom: vs(20),
    },
    title: {
      fontSize: ms(24),
      lineHeight: ms(30),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
      marginBottom: vs(8),
    },
    subtitle: {
      fontSize: ms(15),
      lineHeight: ms(22),
      fontWeight: '500',
      color: colors.onboardingMuted,
      letterSpacing: 0,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: ms(8),
      marginBottom: vs(24),
    },
    chip: {
      paddingHorizontal: ms(13),
      paddingVertical: vs(9),
      borderRadius: ms(18),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
    },
    chipSelected: {
      backgroundColor: colors.warmIconChipBg,
      borderColor: colors.onboardingPushDeep,
    },
    chipText: {
      fontSize: ms(13),
      lineHeight: ms(17),
      fontWeight: '700',
      color: colors.onboardingMuted,
      letterSpacing: 0,
    },
    chipTextSelected: {
      color: colors.onboardingInk,
    },
    inputBlock: {
      marginBottom: vs(12),
    },
    inputLabel: {
      fontSize: ms(14),
      lineHeight: ms(18),
      fontWeight: '800',
      color: colors.onboardingInk,
      letterSpacing: 0,
      marginBottom: vs(8),
    },
    textArea: {
      minHeight: vs(150),
      borderRadius: ms(18),
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: vs(14),
      fontSize: ms(15),
      lineHeight: ms(21),
      color: colors.onboardingInk,
      letterSpacing: 0,
    },
    cta: {
      marginHorizontal: 0,
      marginTop: vs(12),
    },
    successCard: {
      minHeight: vs(210),
      borderRadius: ms(20),
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.onboardingLine,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    successIcon: {
      width: ms(54),
      height: ms(54),
      borderRadius: ms(18),
      backgroundColor: '#FFF4D1',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: vs(14),
    },
    successText: {
      fontSize: ms(17),
      lineHeight: ms(24),
      fontWeight: '800',
      color: colors.onboardingInk,
      textAlign: 'center',
      letterSpacing: 0,
    },
  });
