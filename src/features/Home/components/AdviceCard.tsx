// src/shared/components/AdviceCard.tsx

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { AdviceTask } from '../types/home';
import { stripOuterQuotes, timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { cardStyles } from './styles';
import { getTypeVisual, typeIcons } from '@shared/utils/typeVisuals';
import TaskFooter from './TaskFooter';
import { Shadow } from '@shared/components/Shadow';
import { Icon } from '@shared/components/Icons';
import TaskMetaRow from './TaskMetaRow';
import TaskCardGradient from './TaskCardGradient';
import { colors, spacing } from '@shared/theme';
import HelperAvatarGroup from './HelperAvatarGroup';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import TaskHeader from './TaskHeader';

type Props = {
  task: AdviceTask;
  onPressCard: (task: AdviceTask) => void;
  onPressSuggest: (task: AdviceTask) => void;
  onPressView: (task: AdviceTask) => void;
  onPressShare?: (task: AdviceTask) => void;
};

export default function AdviceCard({ task, onPressCard, onPressShare }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, type, helpers } = task;
  const { emoji } = getTypeVisual(type);

  const quoteSize = ms(120);

  const helpersNew = helpers.concat(helpers);
  return (
    <Shadow size="tint" style={cardStyles.card}>
      <TaskCardGradient style={cardStyles.gradient} type={type}>
        {/* Decorative quote */}
        <View style={styles.backgroundShadeView}>
          <Icon
            set="fa6"
            name={typeIcons.advice}
            size={quoteSize}
            color={colors.adviceBgHardest}
            style={styles.openQuote}
          />
        </View>

        <TouchableOpacity
          style={cardStyles.touchable}
          activeOpacity={0.7}
          onPress={() => onPressCard(task)}
        >
          {/* Header */}
          <TaskHeader
            avatar={avatar || ''}
            name={name}
            createdAt={createdAt}
            type={TaskTypeEnum.Advice}
            helpers={helpers}
          />

          {/* Message */}
          <View style={cardStyles.messageRow}>
            <TextElement variant="title" style={cardStyles.mainText}>
              {stripOuterQuotes(text)}
            </TextElement>
          </View>

          {/* Footer */}
          <View style={{ marginTop: spacing.md }}>
            <TaskFooter
              commentCount={task.commentsCount ?? 0}
              viewCount={task.viewCount ?? 0}
              shareHandler={() => onPressShare?.(task)}
              taskDetails={task}
              hasPushed={task.hasPushed}
              pushCount={task.pushCount ?? 0}
              onPressPush={() => {}}
            />
          </View>
        </TouchableOpacity>
      </TaskCardGradient>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  backgroundShadeView: {
    position: 'absolute',
    top: vs(0),
    right: 5,
    transform: [{ rotate: '25deg' }],
  },
  openQuote: {
    opacity: 0.05,
    // transform: [{ rotate: '180deg' }],
  },
});
