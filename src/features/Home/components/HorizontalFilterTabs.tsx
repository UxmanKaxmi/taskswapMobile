import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { View, FlatList, Pressable, StyleSheet, ListRenderItem } from 'react-native';
import TextElement from '@shared/components/TextElement/TextElement';
import { colors, spacing } from '@shared/theme';
import ListView from '@shared/components/ListView/ListView';
import { ms, vs } from 'react-native-size-matters';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import FilterPill from './FilterPill';

type FilterKey = 'all' | 'motivation' | 'advice' | 'decision' | 'reminder';

type Filter = {
  key: FilterKey;
  label: string;
};

const FILTERS: Filter[] = [
  { key: 'all', label: 'All' },
  { key: 'motivation', label: 'Motivation' },
  { key: 'advice', label: 'Advice' },
  { key: 'decision', label: 'Decision' },
  { key: 'reminder', label: 'Reminder' },
];

type Props = {
  value: FilterKey;
  onChange: (key: FilterKey) => void;
};

export default function HorizontalFilterTabs({ value, onChange }: Props) {
  const listRef = useRef<FlatList<Filter>>(null);
  const [activeKey, setActiveKey] = useState<FilterKey>(value);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setActiveKey(value);
  }, [value]);

  useEffect(() => {
    const index = FILTERS.findIndex(f => f.key === activeKey);
    if (index === -1) return;

    const isFirst = index === 0;
    const isLast = index === FILTERS.length - 1;

    listRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: isFirst ? 0 : isLast ? 1 : 0.5,
    });
  }, [activeKey]);

  const handlePress = useCallback(
    (key: FilterKey) => {
      if (key === activeKey) return;
      setActiveKey(key);
      startTransition(() => onChange(key));
    },
    [activeKey, onChange, startTransition],
  );

  const renderItem: ListRenderItem<Filter> = ({ item }) => (
    <FilterPill
      label={item.label}
      active={item.key === activeKey}
      onPress={() => handlePress(item.key)}
    />
  );

  return (
    <View style={styles.container}>
      <ListView
        data={FILTERS}
        renderItem={renderItem}
        listRef={listRef}
        flatListProps={{
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          contentContainerStyle: styles.listContent,

          // IMPORTANT: prevents scrollToIndex crash
          getItemLayout: (_, index) => ({
            length: ms(88), // approximate pill width
            offset: ms(88) * index,
            index,
          }),
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    marginHorizontal: -spacing.md, // 👈 escape parent padding
    paddingHorizontal: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
