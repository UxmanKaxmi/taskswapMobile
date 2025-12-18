import React from 'react';
import { View, StyleSheet } from 'react-native';
import Tag from './Tag';
import { spacing } from '@shared/theme';
import { haptics } from '@shared/utils/haptics';
import { showToast } from '@shared/utils/toast';

type RenderTagArgs<T extends string> = {
  tag: T;
  selected: boolean;
  toggle: () => void;
};

type Props<T extends string> = {
  tags: readonly T[];
  value: T[];
  onChange: (next: T[]) => void;
  renderTag?: (args: RenderTagArgs<T>) => React.ReactNode;
  onBlockedToggle?: () => void;
};

export default function TagGroup<T extends string>({
  tags,
  value,
  onChange,
  renderTag,
  onBlockedToggle,
}: Props<T>) {
  const toggle = (tag: T) => {
    // Prevent unselecting the last tag
    if (value.includes(tag) && value.length === 1) {
      haptics.selection(); // gentle feedback
      onBlockedToggle?.();

      return;
    }

    onChange(value.includes(tag) ? value.filter(t => t !== tag) : [...value, tag]);
  };

  return (
    <View style={styles.container}>
      {tags.map(tag => {
        const selected = value.includes(tag);

        if (renderTag) {
          return (
            <React.Fragment key={tag}>
              {renderTag({
                tag,
                selected,
                toggle: () => toggle(tag),
              })}
            </React.Fragment>
          );
        }

        // Default rendering (simple pill)
        return <Tag key={tag} label={tag} selected={selected} onPress={() => toggle(tag)} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
