// src/navigation/ProtectedWrapper.tsx
import React from 'react';
import { useAuth } from '@features/Auth/AuthProvider';
import AuthIntroScreen from '@features/Auth/screens/AuthIntroScreen';

export function ProtectedTabScreen({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (!user) return <AuthIntroScreen />;
  return children;
}
