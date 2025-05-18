// src/shared/components/Toast/TaskSwapToast.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Icon from '@react-native-vector-icons/fontawesome6';

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

export default function TaskSwapToast({ text1, text2, type }: Props) {
  const icon = iconMap[type];

  return (
    <View style={[styles.toastContainer]}>
      <Icon name={icon.name} size={22} color={icon.color} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {!!text2 && <Text style={styles.message}>{text2}</Text>}
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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
