/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import {
  registerBackgroundMessageHandler,
  registerBackgroundNotificationEventHandler,
} from './src/lib/notifications/initNotifications';

registerBackgroundMessageHandler();
registerBackgroundNotificationEventHandler();

AppRegistry.registerComponent(appName, () => App);
