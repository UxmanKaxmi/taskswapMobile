import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing, colors } from '@shared/theme';
import Icon from '@shared/components/Icons/Icon'; // assumes you have an icon component
import { ms, vs } from 'react-native-size-matters';
import { isAndroid } from '@shared/utils/constants';
import Row from '../Layout/Row';
import { Width } from '../Spacing';
import Ripple from '../Buttons/Ripple';
import TextElement from '../TextElement/TextElement';

type Props = {
  title?: string;
  showTitle?: boolean;
  showNavigation?: boolean;
  right?: React.ReactNode;
  showCross?: boolean;
};

export default function AppHeader({
  title = '',
  showTitle = true,
  showNavigation = true,
  right = null,
  showCross = false,
}: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        {showCross ? (
          <Ripple onPress={navigation.goBack}>
            <Icon set="ion" name="close" size={26} color={colors.text} />
          </Ripple>
        ) : showNavigation ? (
          <Ripple onPress={navigation.goBack}>
            <Icon set="ion" name="chevron-back" size={24} color={colors.tabActive} />
          </Ripple>
        ) : (
          <View style={styles.side} />
        )}
      </View>

      {showTitle && (
        <TextElement variant="subtitle" style={styles.title}>
          {title}
        </TextElement>
      )}

      {right !== null ? right : <Width size={ms(50)} style={styles.side} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ms(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // borderBottomColor: colors.border,
  },
  title: {
    fontSize: ms(18),
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    // backgroundColor: 'green',
  },
  side: {
    // width: ms(50),
    // backgroundColor: 'blue',
  },
  leftSide: {
    width: ms(50),
    left: -8,
    justifyContent: 'flex-start',
    // backgroundColor: 'red',
  },
});
