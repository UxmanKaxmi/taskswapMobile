import EmptyState from '@features/Empty/EmptyState';
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
  RefreshControl,
} from 'react-native';

export type ListViewProps<ItemT> = {
  data?: ItemT[];
  renderItem?: ListRenderItem<ItemT>;
  flatListProps?: Omit<FlatListProps<ItemT>, 'data' | 'renderItem'>;
  scrollViewProps?: ScrollViewProps;
  children?: ReactNode;
  style?: ViewStyle;
  onRefresh?: () => void;
  refreshing?: boolean;

  /**
   * Optional component to show when the data array is empty.
   */
  emptyComponent?: React.ReactElement | (() => React.ReactElement);
};

export function ListView<ItemT>(props: ListViewProps<ItemT>) {
  const { data, renderItem, flatListProps, scrollViewProps, children, style, emptyComponent } =
    props;

  const isEmpty = data && data.length === 0;

  const renderEmpty = () => {
    if (typeof emptyComponent === 'function') return emptyComponent();
    if (React.isValidElement(emptyComponent)) return emptyComponent;
    return <EmptyState />;
  };

  if (data && renderItem) {
    return (
      <FlatList
        bounces={!!props.onRefresh}
        style={style}
        data={data}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty()}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          props.onRefresh ? (
            <RefreshControl refreshing={!!props.refreshing} onRefresh={props.onRefresh} />
          ) : undefined
        }
        {...flatListProps}
      />
    );
  }

  return (
    <ScrollView
      bounces={!!props.onRefresh}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      style={[styles.scroll, style]}
      refreshControl={
        props.onRefresh ? (
          <RefreshControl refreshing={!!props.refreshing} onRefresh={props.onRefresh} />
        ) : undefined
      }
      {...scrollViewProps}
    >
      {children ? children : renderEmpty()}
    </ScrollView>
  );
}

export default ListView;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
});
