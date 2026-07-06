import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import PrimaryButton from '@shared/components/Buttons/PrimaryButton';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { platformShadow, spacing, type ThemeColors, useTheme } from '@shared/theme';
import { GoalTypeEnum } from '@features/Goals/types/goals';
import type { ComingSoonModalPayload } from '../modalTypes';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import { typeIcons } from '@shared/utils/typeVisuals';

const CLOSE_ANIMATION_DELAY_MS = 280;

const getComingSoonCopy = (colors: ThemeColors) =>
  ({
    [GoalTypeEnum.Advice]: {
      accent: colors.adviceBgHardest,
      bubble: colors.adviceIconBackground,
      title: 'Advice is coming soon',
      body:
        'Soon, you’ll be able to ask for thoughtful advice from people who understand.' +
        '\n \n' +
        ' For now, share what you’re struggling with and get a motivational push.',
    },
    [GoalTypeEnum.Decision]: {
      accent: colors.decisionBgHardest,
      bubble: colors.decisionIconBackground,
      title: 'Decisions are coming soon',
      body:
        'Soon, you’ll be able to get help choosing when you feel stuck.' +
        '\n \n' +
        ' For now, post your situation and let others push you forward.',
    },
    [GoalTypeEnum.Reminder]: {
      accent: colors.reminderBgHardest,
      bubble: colors.reminderIconBackground,
      title: 'Reminders are coming soon',
      body:
        'Soon, you’ll be able to set gentle nudges for later.' +
        '\n \n' +
        ' For now, create a motivation and come back with a progress update.',
    },
    [GoalTypeEnum.Motivation]: {
      accent: colors.motivationBgHardest,
      bubble: colors.motivationIconBackground,
      title: 'Motivation is available',
      body: 'Create a motivation to get a push from people who can help you move forward.',
    },
  }) as const;

type Props = {
  payload: ComingSoonModalPayload;
  closeModal: () => void;
};

export default function ComingSoonModalContent({ payload, closeModal }: Props) {
  const { colors } = useTheme();
  const copy = getComingSoonCopy(colors)[payload.type];
  const iconName = typeIcons[payload.type];
  const { height } = useWindowDimensions();
  const minContentHeight = Math.max(vs(360), height * 0.6 - vs(25));

  const handleCreateMotivation = () => {
    closeModal();
    setTimeout(payload.onCreateMotivation, CLOSE_ANIMATION_DELAY_MS);
  };

  return (
    <View style={[styles.container, { minHeight: minContentHeight }]}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: copy.bubble },
            platformShadow({
              color: copy.bubble,
              opacity: 0.7,
              radius: 8,
              offset: { width: 0, height: 4 },
            }),
          ]}
        >
          <Icon set="fa6" name={iconName} iconStyle="solid" size={34} color={copy.accent} />
        </View>

        <TextElement variant="headline" weight="700" style={styles.title}>
          {copy.title}
        </TextElement>

        <TextElement variant="body" color="muted" style={styles.body}>
          {copy.body}
        </TextElement>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          title="Create a motivation"
          onPress={handleCreateMotivation}
          backgroundColor={copy.accent}
          style={styles.primaryButton}
          textStyle={styles.primaryText}
        />

        <OutlineButton
          title="Not now"
          onPress={closeModal}
          style={styles.secondaryButton}
          textStyle={{ ...styles.secondaryText, color: copy.accent }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  iconBubble: {
    width: ms(92),
    height: ms(92),
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(10),
  },
  title: {
    marginTop: vs(28),
    textAlign: 'center',
    fontSize: ms(24),
  },
  body: {
    marginTop: vs(10),
    textAlign: 'center',
    fontSize: ms(14),
    // lineHeight: ms(29),
    paddingHorizontal: spacing.md,
  },
  primaryButton: {
    alignSelf: 'stretch',
    marginTop: vs(4),
    marginBottom: 0,
    marginHorizontal: 0,
  },
  primaryText: {},
  actions: {
    alignSelf: 'stretch',
    marginTop: 'auto',
    paddingBottom: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 0,
    marginTop: vs(4),
  },
  secondaryText: {
    textAlign: 'center',
  },
});
