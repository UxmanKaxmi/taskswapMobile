import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import TextElement from '@shared/components/TextElement/TextElement';
import { Layout } from '@shared/components/Layout';
import { colors } from '@shared/theme';
import Icon from '@shared/components/Icons/Icon';

import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import { haptics } from '@shared/utils/haptics';
import ImpactOptionCard from '../components/ImpactOptionCard';
import { impactTypeVisuals } from '@shared/utils/typeVisuals';
import type { AddTaskStackParamList } from '../navigation/AddTaskNavigator';
import { useModal } from '@shared/components/ModalProvider';

const IMPACT_OPTIONS = [
  {
    type: TaskTypeEnum.Motivation,
    title: 'Motivation',
    description: 'Need energy to get started.',
  },
  {
    type: TaskTypeEnum.Advice,
    title: 'Advice',
    description: 'Want thoughts from someone you trust.',
  },
  {
    type: TaskTypeEnum.Decision,
    title: 'Decision',
    description: 'Need help choosing.',
  },
  {
    type: TaskTypeEnum.Reminder,
    title: 'Reminder',
    description: 'Want a nudge later.',
  },
] as const;

const ENABLED_TASK_TYPES = new Set<TaskTypeEnum>([TaskTypeEnum.Motivation]);

export default function ChooseImpactScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AddTaskStackParamList>>();
  const { openComingSoonSheet } = useModal();

  const isTypeEnabled = (type: TaskTypeEnum) => {
    return ENABLED_TASK_TYPES.has(type);
  };

  const handleGoBack = () => {
    let current: any = navigation;
    while (current) {
      if (typeof current.canGoBack === 'function' && current.canGoBack()) {
        current.goBack();
        return;
      }
      current = typeof current.getParent === 'function' ? current.getParent() : undefined;
    }
  };

  const goToCreate = (type: TaskTypeEnum) => {
    if (!isTypeEnabled(type)) {
      openComingSoonSheet({
        type,
        onCreateMotivation: () => navigation.navigate('AddMotivation'),
      });
      return;
    }

    haptics.open();

    switch (type) {
      case TaskTypeEnum.Advice:
        navigation.navigate('AddAdvice');
        break;
      case TaskTypeEnum.Motivation:
        navigation.navigate('AddMotivation');
        break;
      case TaskTypeEnum.Decision:
        navigation.navigate('AddDecision');
        break;
      case TaskTypeEnum.Reminder:
        navigation.navigate('AddReminder');
        break;
    }
  };

  return (
    <Layout
      backgroundColor={colors.background}
      allowPaddingHorizontal={false}
      allowPaddingVertical={false}
      edgesProp={['top', 'left', 'right']}
    >
      <View style={styles.screen}>
        <View style={styles.closeRow}>
          <Pressable hitSlop={10} onPress={handleGoBack} style={styles.closeButton}>
            <Icon set="ion" name="close" size={26} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.copyBlock}>
          <TextElement variant="headline" weight="700" style={styles.title}>
            What kind of support do you need?
          </TextElement>
          <TextElement variant="bodySmall" color="muted" style={styles.subtitle}>
            Choose what would help most right now.
          </TextElement>
        </View>

        <View style={styles.options}>
          {IMPACT_OPTIONS.map(option => {
            const visual = impactTypeVisuals[option.type];
            const isAvailable = isTypeEnabled(option.type);

            return (
              <ImpactOptionCard
                key={option.type}
                title={option.title}
                description={option.description}
                icon={visual.icon}
                color={visual.color}
                bg={visual.background}
                onPress={() => goToCreate(option.type)}
                dimmed={!isAvailable}
              />
            );
          })}
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  closeRow: {
    alignItems: 'flex-start',
  },
  closeButton: {
    padding: 2,
  },
  copyBlock: {
    marginTop: 36,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted,
  },
  options: {
    marginTop: 24,
    gap: 10,
  },
});
