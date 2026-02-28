import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import TextElement from '@shared/components/TextElement/TextElement';
import { Layout } from '@shared/components/Layout';
import { spacing, colors } from '@shared/theme';

import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import AppHeader from '@shared/components/AppHeader/AppHeader';
import { impactTypeVisuals } from '@shared/utils/typeVisuals';
import { haptics } from '@shared/utils/haptics';
import { AppStackParamList } from '@navigation/types/navigation';
import { showToast } from '@shared/utils/toast';
import ImpactOptionCard from '../components/ImpactOptionCard';
import { ms, vs } from 'react-native-size-matters';
import { useFeatureFlags } from '@shared/featureFlags';

export default function ChooseImpactScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { flags, loading: flagsLoading } = useFeatureFlags();

  const isTypeEnabled = (type: TaskTypeEnum) => {
    switch (type) {
      case TaskTypeEnum.Motivation:
        return flags.motivation;
      case TaskTypeEnum.Advice:
        return flags.advice;
      case TaskTypeEnum.Decision:
        return flags.decision;
      case TaskTypeEnum.Reminder:
        return flags.reminder;
      default:
        return false;
    }
  };

  const goToCreate = (type: TaskTypeEnum) => {
    if (flagsLoading) {
      showToast({
        type: 'info',
        title: 'Just a sec',
        message: 'We’re checking what’s available.',
      });
      return;
    }

    if (!isTypeEnabled(type)) {
      showToast({
        type: 'info',
        title: 'Coming soon',
        message: 'This push type isn’t available yet.',
      });
      return;
    }

    haptics.open();
    console.log('type', type);
    switch (type) {
      case TaskTypeEnum.Advice:
        navigation.navigate('AddTask', { screen: 'AddAdvice' });
        break;

      case TaskTypeEnum.Motivation:
        navigation.navigate('AddTask', { screen: 'AddMotivation' });
        break;

      case TaskTypeEnum.Decision:
        navigation.navigate('AddTask', { screen: 'AddDecision' });
        break;

      case TaskTypeEnum.Reminder:
        navigation.navigate('AddTask', { screen: 'AddReminder' });
        break;

      default:
        showToast({
          type: 'error',
          title: 'Unsupported task type',
        });
    }
  };

  const IMPACT_TYPES: TaskTypeEnum[] = [
    TaskTypeEnum.Motivation,
    TaskTypeEnum.Advice,
    TaskTypeEnum.Decision,
    TaskTypeEnum.Reminder,
  ];

  return (
    <Layout>
      <AppHeader title="" showCross />
      {/* Header */}
      {/* <Row justify="space-between" align="center" style={styles.header}>
        <Ripple onPress={() => navigation.goBack()}>
          <Icon set="ion" name="close" size={26} color={colors.text} />
        </Ripple>

        <TextElement weight="600">New Push</TextElement>

        <View style={{ width: 20 }} />
      </Row> */}

      {/* Title */}
      <View style={styles.titleRow}>
        <TextElement style={styles.titleText} variant="title" weight="600">
          What kind of{' '}
        </TextElement>

        <View style={styles.underlinedWord}>
          <TextElement style={styles.titleText} variant="title" weight="600" color="primary">
            push
          </TextElement>
          <View style={styles.underline} />
        </View>

        <TextElement style={styles.titleText} variant="title" weight="600">
          do you want?
        </TextElement>
      </View>

      <View>
        <TextElement color="muted" style={styles.subtitle}>
          Choose what you need right now to keep moving forward.
        </TextElement>
      </View>

      {/* Options */}
      <View style={styles.options}>
        {IMPACT_TYPES.map(type => {
          const visual = impactTypeVisuals[type];
          const isAvailable = flagsLoading ? true : isTypeEnabled(type);
          return (
            <ImpactOptionCard
              key={type}
              title={visual.title}
              description={visual.description}
              icon={visual.icon}
              color={visual.color}
              bg={visual.background}
              onPress={() => goToCreate(type)}
              dimmed={!isAvailable}
            />
          );
        })}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    // paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  titleWrap: {
    // paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: vs(20),
    fontSize: ms(14),
  },
  options: {
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginTop: vs(30),
    // marginBottom: vs(20),
  },

  underlinedWord: {
    position: 'relative',
    marginHorizontal: 2,
  },

  underline: {
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.35,
    marginTop: -4, // pulls underline closer to text
  },
  titleText: {
    fontSize: ms(28),
  },
});
