/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { registerBackgroundMessageHandler } from './src/lib/notifications/initNotifications';

registerBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
