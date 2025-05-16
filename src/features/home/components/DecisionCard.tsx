// src/shared/components/DecisionCard.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ms, vs } from 'react-native-size-matters';

import TextElement from '@shared/components/TextElement/TextElement';
import OutlineButton from '@shared/components/Buttons/OutlineButton';
import Row from '@shared/components/Layout/Row';
import { colors, spacing, typography } from '@shared/theme';
import { DecisionTask } from '../types/home';
import { timeAgo, capitalizeFirstLetter } from '@shared/utils/helperFunctions';
import Column from '@shared/components/Layout/Column';

type Props = {
  task: DecisionTask;
  onPressCard: (task: DecisionTask) => void;
  onPressSuggest: (task: DecisionTask) => void;
  onPressView: (task: DecisionTask) => void;
};

export default function DecisionCard({ task, onPressCard, onPressSuggest, onPressView }: Props) {
  const { avatar, name = 'John Doe', createdAt, text, options, type } = task;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => onPressCard(task)}>
      <Row justify="space-between" style={styles.cardHeader}>
        <Row>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View>
            <TextElement variant="subtitle" style={styles.name}>
              {name}
            </TextElement>
            <TextElement variant="caption" style={styles.timeAgo} color="muted">
              {timeAgo(createdAt)}
            </TextElement>
          </View>
        </Row>
        <TextElement variant="caption" color="muted" style={styles.type}>
          {capitalizeFirstLetter(type)}
        </TextElement>
      </Row>

      {/* Task text + optional emoji */}
      <View style={styles.messageRow}>
        <TextElement variant="body">{text}</TextElement>
        {/* {emoji && (
          <TextElement variant="body" style={styles.emoji}>
            {emoji}
          </TextElement>
        )} */}
      </View>

      {/* Action buttons */}
      <Row style={styles.actions}>
        {options.map((val, index) => (
          <OutlineButton
            title={val}
            onPress={() => onPressSuggest(task)}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        ))}
      </Row>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  type: {
    fontSize: ms(12),
    fontWeight: '500',
    backgroundColor: colors.border,
    paddingVertical: ms(4),
    paddingHorizontal: ms(12),
    borderRadius: 20,
    color: colors.text,
  },
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
    width: ms(50),
    height: ms(50),
    borderRadius: ms(50) / 2,
  },

  name: {
    marginLeft: spacing.xs,
  },
  timeAgo: {
    marginLeft: spacing.xs,
    margin: 0,
    padding: 0,
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
