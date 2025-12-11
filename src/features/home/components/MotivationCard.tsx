// src/shared/components/MotivationCard.tsx

import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { colors, spacing } from '@shared/theme';
import { MotivationTask } from '../types/home';
import { timeAgo } from '@shared/utils/helperFunctions';
import { cardStyles } from './styles';
import { getTypeVisual, typeBackgrounds } from '@shared/utils/typeVisuals';
import TaskFooter from './TaskFooter';

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

  return (
    <TouchableOpacity
      style={[
        cardStyles.card,
        {
          backgroundColor: typeBackgrounds[type],
          borderColor: typeBackgrounds[type],
        },
      ]}
      activeOpacity={0.7}
      onPress={() => onPressCard(task)}
    >
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

      {/* Motivation message row (small + emoji like ReminderCard) */}
      <View style={cardStyles.messageRow}>
        <TextElement variant="title" style={cardStyles.mainText}>
          {emoji} {text}
        </TextElement>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <TaskFooter
          commentCount={task.commentsCount ?? 0}
          shareHandler={() => onPressShare?.(task)}
          viewCount={task.viewCount ?? 0}
          // ❌ No extra icon for Advice (no votes/helpers)
        />
      </View>
    </TouchableOpacity>
  );
}
