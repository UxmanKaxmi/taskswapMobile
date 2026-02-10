import { Platform } from 'react-native';
import Config from 'react-native-config';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const APP_NAME = 'Push Me Up';

export const CONTACTS_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly';

export const DEFAULT_PROFILE_IMAGE_SIZE = 120;

export const APP_ENV = Config.APP_ENV || (__DEV__ ? 'development' : 'production');
export const isDEV = APP_ENV !== 'production';
export const isPROD = APP_ENV === 'production';
