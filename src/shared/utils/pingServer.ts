// src/shared/utils/pingServer.ts

import { api } from '@shared/api/axios';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export async function pingServer() {
  const LOCALHOST = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

  console.log('Google Signin config:', await GoogleSignin.getCurrentUser());

  /** Check axios baseURL health */
  try {
    const res = await api.get('/health');
    if (res.status === 200 && res.data.ok) {
      console.log('✅ Backend reachable!', res.data);
    } else {
      console.log('⚠️ Health check returned non-OK response', res);
    }
  } catch (err) {
    console.error('❌ Cannot reach backend via axios baseURL:', err);
  }

  /** Check DB connection endpoint */
  try {
    const res = await api.get(`${LOCALHOST}/test-db`);
    const data = res.data;

    if (data.connected) {
      console.log('✅ DB connected. Users:', data.users);
    } else {
      console.log('❌ DB connection failed:', data.error);
    }
  } catch (err) {
    console.error('❌ Error fetching /test-db:', err);
  }
}
