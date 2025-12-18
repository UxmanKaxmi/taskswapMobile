import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import Ripple from '../Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import { ms } from 'react-native-size-matters';
import { typeIcons } from '@shared/utils/typeVisuals';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  iconName?: string; // leading icon
  style?: ViewStyle;
};

export default function Tag({
  label,
  selected = false,
  onPress,
  onRemove,
  iconName = 'pricetag', // sensible default
  style,
}: Props) {
  return (
    <Ripple onPress={onPress} style={[styles.container, selected && styles.selected, style]}>
      <View style={styles.content}>
        {/* Leading icon */}
        <Icon
          set="fa6"
          name={iconName}
          size={ms(12)}
          color={selected ? colors.background : colors.primary}
          iconStyle={selected ? 'solid' : 'regular'}
        />

        {/* Label */}
        <TextElement
          variant="body"
          weight="500"
          color={selected ? 'background' : 'primary'}
          style={styles.label}
        >
          {label}
        </TextElement>
        {/* Close icon (only when selected) */}
        {/* {selected && (
          <Ripple onPress={onRemove ?? onPress} style={styles.close}>
            <Icon set="fa6" name="close" size={14} color={colors.background} />
          </Ripple>
        )} */}
      </View>
    </Ripple>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  label: {
    marginHorizontal: 2,
    fontSize: ms(12),
  },
  close: {
    marginLeft: spacing.xs,
    padding: 2, // easier tap target
    borderRadius: 999,
  },
});
