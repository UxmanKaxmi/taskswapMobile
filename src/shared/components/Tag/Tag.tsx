import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import Ripple from '../Buttons/Ripple';
import Icon from '@shared/components/Icons/Icon';
import { ms } from 'react-native-size-matters';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  iconName?: string; // leading icon
  selectOnly?: boolean; // simple selectable pill (no icon)
  style?: ViewStyle;
  fillColor?: string; // override default fill color
  borderColor?: string; // override default border color
  labelColor?: keyof typeof colors; // override default label color
};

export default function Tag({
  label,
  selected = false,
  onPress,
  onRemove: _onRemove,
  iconName = 'pricetag', // sensible default
  selectOnly = false,
  style,
  fillColor,
  borderColor,
  labelColor,
}: Props) {
  return (
    <Ripple
      onPress={onPress}
      style={[
        styles.container,
        selected && styles.selected,
        style,
        fillColor && { backgroundColor: fillColor, borderColor: fillColor },
        { borderColor: borderColor || (selected ? colors.primary : colors.background) },
      ]}
    >
      <View style={[styles.content, selectOnly && styles.selectOnlyContent]}>
        {!selectOnly && (
          <Icon
            set="fa6"
            name={iconName}
            size={ms(12)}
            color={labelColor ? colors[labelColor] : selected ? colors.background : colors.primary}
            iconStyle={selected ? 'solid' : 'regular'}
          />
        )}

        {/* Label */}
        <TextElement
          variant="body"
          weight="500"
          color={labelColor ? colors[labelColor] : selected ? colors.background : colors.primary}
          style={[styles.label, selectOnly && styles.selectOnlyLabel]}
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
    borderWidth: StyleSheet.hairlineWidth,
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
    lineHeight: ms(12),
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  selectOnlyContent: {
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  selectOnlyLabel: {
    marginHorizontal: 0,
  },
});
