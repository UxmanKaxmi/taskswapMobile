import { createNavigationContainerRef } from '@react-navigation/native';

import type { MainStackParamList } from './types/navigation';

export const navigationRef = createNavigationContainerRef<MainStackParamList>();
