// src/shared/components/Toast/toastConfig.ts
import React from 'react';
import PushMeUpToast from './PushMeUpToast';
import { ToastConfigParams } from 'react-native-toast-message';
import PushToast, { PushToastProps } from './PushToast';

export const toastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<any>) => (
    <PushMeUpToast type="success" text1={text1 || ''} text2={text2} />
  ),
  error: ({ text1, text2 }: ToastConfigParams<any>) => (
    <PushMeUpToast type="error" text1={text1 || ''} text2={text2} />
  ),
  info: ({ text1, text2 }: ToastConfigParams<any>) => (
    <PushMeUpToast type="info" text1={text1 || ''} text2={text2} />
  ),
  push: ({ props }: ToastConfigParams<PushToastProps>) => (
    <PushToast pusherName={props?.pusherName ?? ''} message={props?.message} />
  ),
};
