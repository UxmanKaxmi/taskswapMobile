declare module 'react-native-config' {
  export interface NativeConfig {
    BASE_URL?: string;
    BASE_URL_IOS?: string;
    BASE_URL_ANDROID?: string;
    GOOGLE_SENDER_ID?: string;
    APP_ENV?: 'development' | 'production' | 'staging' | string;
  }

  const Config: NativeConfig;
  export default Config;
}
