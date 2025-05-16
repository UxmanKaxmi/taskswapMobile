// src/shared/components/DecisionCard.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import Row from '@shared/components/Layout/Row';
import { spacing, typography } from '@shared/theme';
import { DecisionTask } from '../types/home';
import { simpleTimeAgo, timeAgo } from '@shared/utils/helperFunctions';

type Props = {
  task: DecisionTask;
  onPressCard: (task: DecisionTask) => void;
  onPressSuggest: (task: DecisionTask) => void;
  onPressView: (task: DecisionTask) => void;
};

export default function DecisionCard({ task, onPressCard, onPressSuggest, onPressView }: Props) {
  const { avatar, name, time, text, emoji, options } = task;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => onPressCard(task)}>
      {/* Header: avatar, name, time */}
      <Row justify="space-between" style={styles.cardHeader}>
        <Row>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <TextElement variant="subtitle" weight="600" style={styles.name}>
            {name}
          </TextElement>
        </Row>
        <TextElement variant="caption" color="muted">
          {simpleTimeAgo(time)}
        </TextElement>
      </Row>

      {/* Task text + optional emoji */}
      <View style={styles.messageRow}>
        <TextElement variant="body">{text}</TextElement>
        {emoji && (
          <TextElement variant="body" style={styles.emoji}>
            {emoji}
          </TextElement>
        )}
      </View>

      {/* Action buttons */}
      <Row style={styles.actions}>
        <OutlineButton
          title={`Suggest (${options.length})`}
          onPress={() => onPressSuggest(task)}
          style={styles.button}
          textStyle={styles.buttonText}
        />
        <OutlineButton
          title="View"
          onPress={() => onPressView(task)}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </Row>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginVertical: vs(8),
    padding: spacing.md,
    borderRadius: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  cardHeader: {
    marginBottom: vs(8),
  },

  avatar: {
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: spacing.lg / 2,
  },

  name: {
    marginLeft: spacing.sm,
  },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  emoji: {
    marginLeft: spacing.sm,
  },

  actions: {
    justifyContent: 'space-between',
  },

  button: {
    flex: 1,
    marginRight: spacing.sm,
    borderRadius: spacing.xs,
    paddingVertical: spacing.sm,
  },

  buttonText: {
    fontSize: typography.small,
  },
});
