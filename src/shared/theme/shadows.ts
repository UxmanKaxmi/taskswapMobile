import { Platform } from 'react-native';

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
};
