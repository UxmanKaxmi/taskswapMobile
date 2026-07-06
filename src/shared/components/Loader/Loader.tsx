import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemeColors, useTheme, useThemedStyles } from '@shared/theme';
import AppModal from '@shared/components/AppModal/AppModal';

type AppLoaderProps = {
  visible: boolean;
};

export default function AppLoader({ visible }: AppLoaderProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <AppModal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </AppModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.background, // semi-transparent backdrop
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
