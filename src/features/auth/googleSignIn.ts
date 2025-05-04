import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '424884151196-8b2midonidm3m1u77konerbc6its5knv.apps.googleusercontent.com', // Replace with real one
});

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  return await GoogleSignin.signIn();
}

export async function signOutGoogle() {
  return await GoogleSignin.signOut();
}
