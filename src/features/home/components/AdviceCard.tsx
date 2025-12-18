// src/shared/components/AdviceCard.tsx

import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AdviceTask } from '../types/home';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { timeAgo } from '@shared/utils/helperFunctions';
import { cardStyles, quoteSize } from './styles';
import { getTypeVisual, typeBackgrounds, typeBackgroundsHard } from '@shared/utils/typeVisuals';
import { colors, spacing } from '@shared/theme';
import TaskFooter from './TaskFooter';
import { Shadow } from '@shared/components/Shadow';
import { Icon } from '@shared/components/Icons';
import { ms, vs } from 'react-native-size-matters';

type Props = {
  task: AdviceTask;
  onPressCard: (task: AdviceTask) => void;
  onPressSuggest: (task: AdviceTask) => void;
  onPressView: (task: AdviceTask) => void;
  onPressShare?: (task: AdviceTask) => void; // ✅ FIXED
};

export default function AdviceCard({ task, onPressCard, onPressShare }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, type } = task;
  const { emoji } = getTypeVisual(type);

  return (
    <Shadow
      size="tint"
      // color={colors.adviceBgHardest}
      style={[
        cardStyles.card,
        {
          backgroundColor: typeBackgrounds[type],
          borderColor: typeBackgrounds[type],
        },
      ]}
    >
      <TouchableOpacity style={[]} activeOpacity={0.7} onPress={() => onPressCard(task)}>
        {/* Header */}
        <Row justify="space-between" style={cardStyles.cardHeader}>
          <Row>
            <Image source={{ uri: avatar }} style={cardStyles.avatar} />

            <View>
              <TextElement variant="subtitle" style={cardStyles.name}>
                {name}
              </TextElement>

              <TextElement variant="caption" color="muted" style={cardStyles.timeAgo}>
                {timeAgo(createdAt)}
              </TextElement>
            </View>
          </Row>

          <TypeTag type={type} />
        </Row>

        {/* Message */}
        <View style={cardStyles.messageRow}>
          <TextElement variant="title" style={cardStyles.mainText}>
            {emoji} {text}
          </TextElement>
        </View>

        {/* <View style={styles.motivationContainer}>
          <Icon
            set="svg"
            name="InvertedComma"
            size={quoteSize}
            color={colors.text}
            style={styles.openQuote}
          />

          <TextElement variant="title" style={styles.motivationText}>
            {text}. I mean it you need to !
          </TextElement>

          <Icon
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
            onPressComments={() => {}}
            taskDetails={task}
          />
        </View>
      </TouchableOpacity>
    </Shadow>
  );
}

const styles = StyleSheet.create({
  openQuote: {
    position: 'absolute',
    // top: spacing.sm,
    left: -5,
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
