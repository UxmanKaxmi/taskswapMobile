// src/shared/components/AdviceCard.tsx

import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { AdviceTask } from '../types/home';

import TextElement from '@shared/components/TextElement/TextElement';
import Row from '@shared/components/Layout/Row';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { timeAgo } from '@shared/utils/helperFunctions';
import { cardStyles as styles } from './styles';
import { getTypeVisual, typeBackgrounds } from '@shared/utils/typeVisuals';
import { spacing } from '@shared/theme';
import TaskFooter from './TaskFooter';

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
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: typeBackgrounds[type],
          borderColor: typeBackgrounds[type],
        },
      ]}
      activeOpacity={0.7}
      onPress={() => onPressCard(task)}
    >
      {/* Header */}
      <Row justify="space-between" style={styles.cardHeader}>
        <Row>
          <Image source={{ uri: avatar }} style={styles.avatar} />

          <View>
            <TextElement variant="subtitle" style={styles.name}>
              {name}
            </TextElement>

            <TextElement variant="caption" color="muted" style={styles.timeAgo}>
              {timeAgo(createdAt)}
            </TextElement>
          </View>
        </Row>

        <TypeTag type={type} />
      </Row>

      {/* Message */}
      <View style={styles.messageRow}>
        <TextElement variant="title" style={styles.mainText}>
          {emoji} {text}
        </TextElement>
      </View>
      <View style={{ marginTop: spacing.md }}>
        <TaskFooter
          commentCount={task.commentsCount ?? 0}
          shareHandler={() => onPressShare?.(task)}
          viewCount={task.viewCount ?? 0}
          onPressComments={() => {}}
        />
      </View>
    </TouchableOpacity>
  );
}
