import React from 'react';
import { Modal, ModalProps, Platform } from 'react-native';

type AppModalProps = ModalProps;

export default function AppModal({
  transparent = true,
  animationType,
  statusBarTranslucent = true,
  hardwareAccelerated = true,
  ...rest
}: AppModalProps) {
  // const resolvedAnimationType = Platform.OS === 'android' ? animationType : undefined;
  // const presentationStyle = Platform.OS === 'ios' ? 'overFullScreen' : undefined;

  return (
    <Modal
      transparent={transparent}
      animationType={animationType}
      // presentationStyle={'fullScreen'}
      statusBarTranslucent={statusBarTranslucent}
      hardwareAccelerated={hardwareAccelerated}
      {...rest}
    />
  );
}
