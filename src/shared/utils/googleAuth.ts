// src/features/auth/googleAuth.ts

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';

// —— CONFIGURE ONCE AT APP STARTUP ——
GoogleSignin.configure({
  webClientId: '424884151196-8b2midonidm3m1u77konerbc6its5knv.apps.googleusercontent.com',
  scopes: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/contacts.readonly', // for contacts import
  ],
  offlineAccess: true,
  profileImageSize: 120,
});

/**
 * Kick off Google Sign-In and return the full result (including idToken & accessToken).
 */
export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  return GoogleSignin.signIn();
}

/**
 * Sign the user out of Google.
 */
export async function signOutGoogle() {
  return GoogleSignin.signOut();
}

/**
 * Fetch the user’s Google Contacts via the People API
 * and return a de-duplicated, lowercase list of email addresses.
 */
export async function fetchGoogleContacts(): Promise<string[]> {
  // Ensure we have a fresh access token
  const { accessToken } = await GoogleSignin.getTokens();

  // Query the People API
  const resp = await axios.get('https://people.googleapis.com/v1/people/me/connections', {
    params: {
      personFields: 'emailAddresses',
      pageSize: 2000,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const connections = resp.data.connections || [];
  const emails = new Set<string>();

  console.log(`Fetched ${connections} connections from Google Contacts`);
  console.log(`Fetched ${emails} connections from Google Contacts`);

  for (const person of connections) {
    const addrs = person.emailAddresses as Array<{ value: string }>;
    if (addrs) {
      for (const { value } of addrs) {
        if (value) emails.add(value.toLowerCase());
      }
    }
  }
  console.log(`Fetched ${emails.size} unique email addresses from Google Contacts`);

  return Array.from(emails);
}
