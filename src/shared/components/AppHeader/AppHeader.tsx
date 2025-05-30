import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing, colors } from '@shared/theme';
import Icon from '@shared/components/Icons/Icon'; // assumes you have an icon component
import { ms, vs } from 'react-native-size-matters';
import { isAndroid } from '@shared/utils/constants';

type Props = {
  title?: string;
  showTitle?: boolean;
  showNavigation?: boolean;
  right?: React.ReactNode;
};

export default function AppHeader({
  title = '',
  showTitle = true,
  showNavigation = true,
  right,
}: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {showNavigation ? (
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon set="ion" name="chevron-back" size={24} color={colors.tabActive} />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}

      {showTitle && <Text style={styles.title}>{title}</Text>}

      {right ? right : <View style={styles.side} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ms(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: spacing.md,
    // borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  side: {
    width: 24,
  },
});
