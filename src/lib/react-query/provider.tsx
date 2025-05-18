// src/lib/react-query/provider.tsx
import React, { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './client';

type Props = {
  children: ReactNode;
};

export default function ReactQueryProvider({ children }: Props) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
