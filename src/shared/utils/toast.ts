// src/shared/utils/toast.ts
import Toast from 'react-native-toast-message';
import type { PushToastProps } from '@shared/components/Toast/PushToast';

type ToastType = 'success' | 'error' | 'info';

type ShowToastOptions = {
  type: ToastType;
  title: string;
  message?: string;
};

/**
 * Displays a toast message using react-native-toast-message.
 *
 * @param {Object} options - Configuration for the toast.
 * @param {'success' | 'error' | 'info'} options.type - Type of the toast (determines style).
 * @param {string} options.title - Main title text for the toast.
 * @param {string} [options.message] - Optional message body shown below the title.
 *
 * @example
 * showToast({
 *   type: 'success',
 *   title: 'Goal Created',
 *   message: 'Your task has been added successfully.',
 * });
 */
export const showToast = ({ type, title, message }: ShowToastOptions) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
};

export const showPushToast = ({ pusherName, message }: PushToastProps) => {
  Toast.show({
    type: 'push' as any,
    props: {
      pusherName,
      message,
    },
    position: 'bottom',
    bottomOffset: 110,
    visibilityTime: 3500,
  });
};
