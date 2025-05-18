// src/shared/utils/toast.ts
import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info';

type ShowToastOptions = {
  type: ToastType;
  title: string;
  message?: string;
};

export const showToast = ({ type, title, message }: ShowToastOptions) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
};
