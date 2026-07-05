// src/shared/components/AdviceCard.tsx

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import { AdviceGoal } from '../types/home';
import { stripOuterQuotes, timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { cardStyles } from './styles';
import { getTypeVisual, typeIcons } from '@shared/utils/typeVisuals';
import GoalFooter from './GoalFooter';
import { Shadow } from '@shared/components/Shadow';
import { Icon } from '@shared/components/Icons';
import GoalMetaRow from './GoalMetaRow';
import GoalCardGradient from './GoalCardGradient';
import { colors, spacing } from '@shared/theme';
import HelperAvatarGroup from './HelperAvatarGroup';
import { GoalTypeEnum } from '@features/Goals/types/goals';
import GoalHeader from './GoalHeader';

type Props = {
  task: AdviceGoal;
  onPressCard: (task: AdviceGoal) => void;
  onPressSuggest: (task: AdviceGoal) => void;
  onPressView: (task: AdviceGoal) => void;
  onPressShare?: (task: AdviceGoal) => void;
};

export default function AdviceCard({ task, onPressCard, onPressShare }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, type, helpers } = task;
  const { emoji } = getTypeVisual(type);

  const quoteSize = ms(120);

  const helpersNew = helpers.concat(helpers);
  return (
    <Shadow size="tint" style={cardStyles.card}>
      <GoalCardGradient style={cardStyles.gradient} type={type}>
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
          <GoalHeader
            avatar={avatar || ''}
            name={name}
            createdAt={createdAt}
            type={GoalTypeEnum.Advice}
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
            <GoalFooter
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
      </GoalCardGradient>
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
