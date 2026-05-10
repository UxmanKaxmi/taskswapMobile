import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Icon from '@shared/components/Icons/Icon';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import { Shadow } from '@shared/components/Shadow/ShadowComponent';
import { ms, vs } from 'react-native-size-matters';
import SectionHeader from '@shared/components/SectionHeader/SectionHeader';
import HelpersRow from './HelpersRow';
import { HelperUser } from '@features/Home/types/home';
import { getHelperHints } from '../utils/taskCopy';
import { TaskTypeEnum } from '@features/Tasks/types/tasks';
import Column from '@shared/components/Layout/Column';

type Props = {
  onPress: () => void;
  helpers: HelperUser[];
  taskType: TaskTypeEnum;
};

export default function TagHelperCard({ helpers, onPress, taskType }: Props) {
  const hasHelpers = helpers.length > 0;

  return (
    <View style={styles.wrapper}>
      <SectionHeader label="Ask someone you trust" icon="person-add" />

      <Shadow size="tint">
        <Pressable style={styles.card} onPress={onPress}>
          <View style={styles.left}>
            {!hasHelpers ? (
              <>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: colors[`${taskType}IconBackground`] },
                  ]}
                >
                  <Icon set="ion" name="add" size={ms(16)} color={colors[`${taskType}BgHardest`]} />
                </View>

                <Column flex={1} gap={1}>
                  <TextElement variant="caption" style={styles.subTextHeading}>
                    Tag a helper
                  </TextElement>

                  <TextElement variant="caption" color="muted" style={styles.subText}>
                    {getHelperHints(taskType)}
                  </TextElement>
                </Column>
              </>
            ) : (
              <HelpersRow taskType={taskType} helpers={helpers} onPress={onPress} />
            )}
          </View>

          <Icon set="ion" name="chevron-forward" size={ms(18)} color={colors.muted} />
        </Pressable>
      </Shadow>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.lg,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    paddingVertical: vs(10),
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subText: {
    fontSize: ms(11),
  },
  subTextHeading: {
    fontSize: ms(13),
    fontWeight: '500',
  },
});
