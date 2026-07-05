// src/shared/components/Toast/PushMeUpToast.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Icon from '@react-native-vector-icons/fontawesome6';
import { resolveAppTextStyle } from '@shared/theme/fonts';
import { platformShadow } from '@shared/theme';

type Props = {
  text1: string;
  text2?: string;
  type: 'success' | 'error' | 'info';
};

const iconMap: Record<
  'success' | 'error' | 'info',
  { name: 'circle-check' | 'circle-xmark' | 'circle-check'; color: string }
> = {
  success: { name: 'circle-check', color: '#4CAF50' },
  error: { name: 'circle-xmark', color: '#f44336' },
  info: { name: 'circle-check', color: '#2196F3' },
};

export default function PushMeUpToast({ text1, text2, type }: Props) {
  const icon = iconMap[type];
  const titleStyle = resolveAppTextStyle(styles.title, { variant: 'label' });
  const messageStyle = resolveAppTextStyle(styles.message, { variant: 'body' });

  return (
    <View style={[styles.toastContainer]}>
      <Icon name={icon.name} size={22} color={icon.color} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={titleStyle}>{text1}</Text>
        {!!text2 && <Text style={messageStyle}>{text2}</Text>}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    width: width * 0.9,
    alignSelf: 'center',
    marginBottom: 30,
    ...platformShadow({
      color: '#000',
      opacity: 0.1,
      radius: 6,
      offset: { width: 0, height: 2 },
    }),
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flexShrink: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 15,
    color: '#333',
  },
  message: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
