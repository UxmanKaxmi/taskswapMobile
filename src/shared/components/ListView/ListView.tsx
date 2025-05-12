import React, { ReactNode } from 'react';
import {
  ScrollView,
  FlatList,
  FlatListProps,
  ListRenderItem,
  ScrollViewProps,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';

export type ListViewProps<ItemT> = {
  /**
   * If provided, renders a FlatList using this data and renderItem.
   * If omitted, renders a ScrollView with children.
   */
  data?: ItemT[];
  renderItem?: ListRenderItem<ItemT>;
  /**
   * Optional props to pass through to FlatList when data is provided.
   */
  flatListProps?: Omit<FlatListProps<ItemT>, 'data' | 'renderItem'>;
  /**
   * Optional props to pass through to ScrollView when data is omitted.
   */
  scrollViewProps?: ScrollViewProps;
  /**
   * Children to render inside a ScrollView (if data is omitted).
   */
  children?: ReactNode;
  /**
   * Container style
   */
  style?: ViewStyle;
};

/**
 * A flexible list container that renders either a FlatList (when `data` + `renderItem` are provided) or a ScrollView (when used with `children`).
 *
 * @template ItemT The type of items in the `data` array.
 * @param {ListViewProps<ItemT>} props
 *
 * @example
 * // FlatList mode
 * <ListView
 *   data={tasks}
 *   renderItem={({ item }) => <TaskRow task={item} />}
 *   flatListProps={{ keyExtractor: (t) => t.id }}
 * />
 *
 * @example
 * // ScrollView mode
 * <ListView scrollViewProps={{ showsVerticalScrollIndicator: false }}>
 *   <Header />
 *   <ProfileInfo user={user} />
 *   <Footer />
 * </ListView>
 */
export function ListView<ItemT>(props: ListViewProps<ItemT>) {
  const { data, renderItem, flatListProps, scrollViewProps, children, style } = props;

  if (data && renderItem) {
    return (
      <FlatList
        bounces={false}
        style={style}
        data={data}
        renderItem={renderItem}
        {...flatListProps}
      />
    );
  }

  return (
    <ScrollView bounces={false} style={[styles.scroll, style]} {...scrollViewProps}>
      {children}
    </ScrollView>
  );
}

export default ListView;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
});
