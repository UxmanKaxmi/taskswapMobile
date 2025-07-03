import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { spacing, colors } from '@shared/theme';
import { timeAgo } from '@shared/utils/helperFunctions';
import { ms } from 'react-native-size-matters';
import Row from '@shared/components/Layout/Row';
import TypeTag from '@shared/components/TypeTag/TypeTag';
import { cardStyles } from '@features/Home/components/styles';

type Props = {};

export default function TaskDetailHeading({ emoji = '🕒', text, senderName, createdAt }: Props) {
  return (
    <View style={styles.container}>
      {/* Main message */}
      <Row justify="space-between" style={cardStyles.cardHeader}>
        <Pressable onPress={() => {}}>
          <Row>
            <Image source={{ uri: '' }} style={cardStyles.avatar} />
            <View>
              <TextElement variant="subtitle" style={cardStyles.name}>
                Usman
              </TextElement>
              <TextElement variant="caption" style={cardStyles.timeAgo} color="muted">
                {timeAgo(createdAt)}
              </TextElement>
            </View>
          </Row>
        </Pressable>
        <TypeTag type={'reminder'} />
      </Row>

      {/* From + time */}
      {/* <View style={styles.subRow}>
        <TextElement style={styles.icon}>🧍</TextElement>
        <TextElement variant="caption" color="muted">
          from {senderName} • {timeAgo(createdAt)}
        </TextElement>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: ms(18),
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: ms(14),
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  icon: {
    fontSize: ms(12),
    marginRight: spacing.xs,
  },
});
