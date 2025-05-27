import { Platform } from 'react-native';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const APP_NAME = 'TaskSwap';

export const CONTACTS_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly';

export const DEFAULT_PROFILE_IMAGE_SIZE = 120;
