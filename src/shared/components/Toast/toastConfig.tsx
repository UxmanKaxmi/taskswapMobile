// src/shared/components/Toast/toastConfig.ts
import React from 'react';
import TaskSwapToast from './TaskSwapToast';
import { ToastConfigParams } from 'react-native-toast-message';
import PushToast, { PushToastProps } from './PushToast';

export const toastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<any>) => (
    <TaskSwapToast type="success" text1={text1 || ''} text2={text2} />
  ),
  error: ({ text1, text2 }: ToastConfigParams<any>) => (
    <TaskSwapToast type="error" text1={text1 || ''} text2={text2} />
  ),
  info: ({ text1, text2 }: ToastConfigParams<any>) => (
    <TaskSwapToast type="info" text1={text1 || ''} text2={text2} />
  ),
  push: ({ props }: ToastConfigParams<PushToastProps>) => (
    <PushToast pusherName={props?.pusherName ?? ''} message={props?.message} />
  ),
};
