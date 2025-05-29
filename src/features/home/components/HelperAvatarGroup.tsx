import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { TaskHelper } from '../types/home';
import TextElement from '@shared/components/TextElement/TextElement';
import { ms } from 'react-native-size-matters';
import { colors } from '@shared/theme';

type Props = {
  helpers: TaskHelper[];
  maxVisible?: number;
};

export default function HelperAvatarGroup({ helpers, maxVisible = 4 }: Props) {
  const visible = helpers.slice(0, maxVisible);
  const remaining = helpers.length - maxVisible;

  return (
    <View style={styles.container}>
      {visible.map((helper, index) => (
        <Image
          key={helper.id}
          source={{ uri: helper.photo }}
          style={[
            styles.avatar,
            {
              left: index * 21,
              zIndex: helpers.length - index,
            },
          ]}
        />
      ))}

      {remaining > 0 && (
        <View style={[styles.more, { left: maxVisible * 21 }]}>
          <TextElement style={styles.moreText}>+{remaining}</TextElement>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: 'red',

    height: ms(38),
    flexDirection: 'row',
    // position: 'relative',
    // alignItems: 'flex-end',
    // justifyContent: 'flex-end',
    // alignContent: 'flex-end',
    // // alignSelf: 'flex-end',
  },
  avatar: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(38),
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#ccc',
  },
  more: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(22),
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreText: {
    color: '#fff',
    fontWeight: '600',
  },
});
