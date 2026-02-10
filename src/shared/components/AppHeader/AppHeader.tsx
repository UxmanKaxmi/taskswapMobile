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
  inDevelopment?: boolean;
};

export default function AppHeader({
  title = '',
  showTitle = true,
  showNavigation = true,
  right = null,
  showCross = false,
  inDevelopment = false,
}: Props) {
  const navigation = useNavigation();

  return (
    <>
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
          <View style={styles.titleRow}>
            <TextElement variant="subtitle" style={styles.title}>
              {title}
            </TextElement>
          </View>
        )}

        {right !== null ? right : <Width size={ms(50)} style={styles.side} />}
      </View>
      {inDevelopment && (
        <View style={styles.devBadge}>
          <View style={styles.devDot} />
          <TextElement style={styles.devText}>This page is in development</TextElement>
        </View>
      )}
    </>
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
    fontWeight: '500',
    textAlign: 'center',
    // backgroundColor: 'green',
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
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
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ms(999),
    paddingHorizontal: ms(8),
    paddingVertical: ms(3),
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: colors.border,
  },
  devDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.warning ?? colors.primary,
    marginRight: ms(4),
  },
  devText: {
    fontSize: ms(10),
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.6,
  },
});
