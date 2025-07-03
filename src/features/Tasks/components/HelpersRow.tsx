import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { ms } from 'react-native-size-matters';
import { colors, spacing } from '@shared/theme';
import { TaskHelper } from '@features/Home/types/home';
import Row from '@shared/components/Layout/Row';

type Props = {
  helpers: TaskHelper[];
  maxVisible?: number;
  onPressAvatar?: (helper: TaskHelper) => void;
};

export default function HelpersRow({ helpers, maxVisible = 3, onPressAvatar }: Props) {
  const visible = helpers.slice(0, maxVisible);
  const remainingCount = helpers.length - maxVisible;
  const nameList = helpers.map(h => h.name);

  // Format name string: "John, Jane, and 1 other"
  const formattedNames = (() => {
    if (nameList.length <= maxVisible) {
      return nameList.join(', ');
    }
    const visibleNames = nameList.slice(0, maxVisible);
    return `${visibleNames.join(', ')} and ${remainingCount} other${remainingCount > 1 ? 's' : ''}`;
  })();

  return (
    <View style={styles.wrapper}>
      <Row align="flex-start" justify="flex-start">
        <View style={styles.avatarRow}>
          {visible.map((helper, index) => (
            <TouchableOpacity key={helper.id} onPress={() => onPressAvatar?.(helper)}>
              <Image
                source={{ uri: helper.photo }}
                style={[styles.avatar, { marginRight: spacing.xs }]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </Row>
      <TextElement variant="caption" color="muted" style={{ fontSize: ms(12), marginTop: 3 }}>
        {formattedNames}
      </TextElement>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(30),
    backgroundColor: '#ccc',
  },
});
