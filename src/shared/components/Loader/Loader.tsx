import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { colors } from '@shared/theme';

type AppLoaderProps = {
  visible: boolean;
};

export default function AppLoader({ visible }: AppLoaderProps) {
  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background, // semi-transparent backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
});
