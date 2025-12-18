// src/shared/components/MotivationCard.tsx

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { colors, spacing } from '@shared/theme';
import { MotivationTask } from '../types/home';
import { stripOuterQuotes, timeAgo, toShortName } from '@shared/utils/helperFunctions';
import { cardStyles } from './styles';
import { getTypeVisual, typeBackgrounds } from '@shared/utils/typeVisuals';
import TaskFooter from './TaskFooter';
import { Shadow } from '@shared/components/Shadow';
import { Icon } from '@shared/components/Icons';
import PushButton from '@shared/components/PushButton';
import TaskMetaRow from './TaskMetaRow';
import TaskCardGradient from './TaskCardGradient';

type Props = {
  task: MotivationTask;
  onPressCard: (task: MotivationTask) => void;
  onPressSuggest: (task: MotivationTask) => void;
  onPressView: (task: MotivationTask) => void;
  onPressShare?: (task: MotivationTask) => void;
};

export default function MotivationCard({ task, onPressCard, onPressShare }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, type } = task;
  const { emoji } = getTypeVisual(type);

  const quoteSize = ms(100);

  return (
    <Shadow
      size="tint"
      // color={colors.motivationBgHardest}
      style={[
        cardStyles.card,
        {
          // backgroundColor: typeBackgrounds[type],
          // borderColor: typeBackgrounds[type],
        },
      ]}
    >
      <TaskCardGradient style={cardStyles.gradient} type={type}>
        <View style={{ position: 'absolute', top: vs(-20), left: -10 }}>
          <Icon
            set="svg"
            name="InvertedComma"
            size={quoteSize}
            color={colors.motivationBgHardest}
            style={styles.openQuote}
          />
        </View>
        <TouchableOpacity
          style={cardStyles.touchable}
          activeOpacity={0.7}
          onPress={() => onPressCard(task)}
        >
          {/* Header */}
          <Row justify="space-between" style={cardStyles.cardHeader}>
            <Row>
              <Image source={{ uri: avatar }} style={cardStyles.avatar} />
              <View>
                <TextElement variant="subtitle" style={cardStyles.name}>
                  {toShortName(name)}
                </TextElement>
                <TaskMetaRow type={'motivation'} timeAgo={timeAgo(createdAt)} />
              </View>
            </Row>

            {/* <TypeTag type={type} /> */}
          </Row>

          {/* Motivation message row (small + emoji like ReminderCard) */}
          {/* Motivation block */}
          {/* <View style={styles.motivationContainer}>
          <Icon
            set="svg"
            name="InvertedComma"
            size={quoteSize}
            color={colors.text}
            style={styles.openQuote}
          /> */}

          <View style={cardStyles.messageRow}>
            <TextElement variant="title" style={cardStyles.mainText}>
              "{stripOuterQuotes(text)}"
            </TextElement>
          </View>

          {/* Closing quote */}
          {/* <Icon
            set="svg"
            name="InvertedComma"
            style={styles.closeQuote}
            size={quoteSize}
            color={colors.text}
          />
        </View> */}

          <View style={{ marginTop: spacing.md }}>
            <TaskFooter
              commentCount={task.commentsCount ?? 0}
              shareHandler={() => onPressShare?.(task)}
              viewCount={task.viewCount ?? 0}
              taskDetails={task}
              // ❌ No extra icon for Advice (no votes/helpers)
            />
          </View>
        </TouchableOpacity>
      </TaskCardGradient>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  openQuote: {
    // position: 'absolute',
    // // top: spacing.sm,
    // left: -5,
    opacity: 0.3,
    transform: [{ rotate: '180deg' }],
  },

  motivationText: {
    fontSize: ms(18),
    fontWeight: '600',
    lineHeight: ms(24),
    marginTop: vs(15),
    marginBottom: vs(12),
    // backgroundColor: 'red',
  },

  closeQuote: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: [{ rotate: '0deg' }],
  },

  motivationContainer: {
    paddingVertical: spacing.lg,
    paddingRight: spacing.lg,
    paddingLeft: ms(10),

    borderRadius: 16,
    position: 'relative',
    minHeight: vs(90),
  },
});
