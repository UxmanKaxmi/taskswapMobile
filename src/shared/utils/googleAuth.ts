// src/features/auth/googleAuth.ts

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import Contacts from '@s77rt/react-native-contacts';
import { Platform, PermissionsAndroid } from 'react-native';

export interface ContactEmail {
  email: string;
  source: 'google' | 'phone';
}

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
export async function fetchGoogleContacts(): Promise<ContactEmail[]> {
  const { accessToken } = await GoogleSignin.getTokens();

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
  const result: ContactEmail[] = [];

  for (const person of connections) {
    const addrs = person.emailAddresses as Array<{ value: string }>;
    if (addrs) {
      for (const { value } of addrs) {
        if (value) {
          result.push({ email: value.toLowerCase(), source: 'google' });
        }
      }
    }
  }

  console.log(`📨 Fetched ${result.length} emails from Google Contacts`);
  return result;
}

/**
 * Fetch contacts from the user's phone and return a de-duplicated, lowercase list of email addresses.
 */
export async function fetchPhoneContacts(): Promise<ContactEmail[]> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'TaskSwap needs access to your contacts to find friends.',
          buttonPositive: 'Allow',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('🚫 Contacts permission denied');
        return [];
      }
    }

    return new Promise(resolve => {
      Contacts.getAll(['firstName', 'lastName', 'phoneNumbers', 'emailAddresses'])
        .then(contacts => {
          const result: ContactEmail[] = [];
          console.log(contacts, 'from phone');
          for (const contact of contacts) {
            if (contact.emailAddresses?.length) {
              for (const { email } of contact.emailAddresses) {
                if (email) {
                  result.push({ email: email.toLowerCase(), source: 'phone' });
                }
              }
            }
          }

          console.log(`📱 Extracted ${result.length} emails from Phone Contacts`);
          resolve(result);
        })
        .catch(err => {
          console.error('❌ Failed to fetch contacts:', err);
          resolve([]);
        });
    });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return [];
  }
}
/**
 * Fetch and merge emails from both Google and Phone contacts.
 */
export async function fetchAllContacts(): Promise<ContactEmail[]> {
  const [googleContacts, phoneContacts] = await Promise.all([
    fetchGoogleContacts(),
    fetchPhoneContacts(),
  ]);

  // Deduplicate by email
  const emailMap = new Map<string, ContactEmail>();
  [...googleContacts, ...phoneContacts].forEach(contact => {
    // console.log('contact', contact);
    if (!emailMap.has(contact.email)) {
      emailMap.set(contact.email, contact);
    }
  });

  return Array.from(emailMap.values());
}
