import { Platform } from 'react-native';
import Config from 'react-native-config';

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const APP_NAME = 'Push Me Up';

export const CONTACTS_SCOPE = 'https://www.googleapis.com/auth/contacts.readonly';

export const DEFAULT_PROFILE_IMAGE_SIZE = 120;
export const SHARE_UPDATE_CHARACTER_LIMIT = 120;
// Minimum characters required before an update can be shared.
export const SHARE_UPDATE_MIN_CHARACTER_LIMIT = 20;

export const APP_ENV = Config.APP_ENV || (__DEV__ ? 'development' : 'production');
export const isDEV = APP_ENV !== 'production';
export const isPROD = APP_ENV === 'production';

export const PROGRESS_UPDATE_COOLDOWN_MS = isDEV ? 60 * 1000 : 6 * 60 * 60 * 1000;
export const PROGRESS_UPDATE_COOLDOWN_LABEL = isDEV ? '1 minute' : '6 hours';
export const PROGRESS_UPDATE_DEFAULT_REMAINING_TIME = isDEV ? '1m' : '6h';
