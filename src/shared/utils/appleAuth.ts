import appleAuth, {
  AppleRequestResponseFullName,
} from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';

export const isAppleSignInSupported = () => Platform.OS === 'ios' && appleAuth.isSupported;

const formatAppleName = (fullName: AppleRequestResponseFullName | null | undefined) => {
  const nameParts = [fullName?.givenName, fullName?.familyName].filter(Boolean);
  return nameParts.join(' ').trim();
};

const decodeJwtPayload = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(globalThis.atob(padded)) as { email?: string };
  } catch {
    return {};
  }
};

export async function signInWithApple() {
  if (!isAppleSignInSupported()) {
    throw new Error('Apple Sign-In is only available on supported iOS devices.');
  }

  const credential = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
  });

  if (!credential.identityToken) {
    throw new Error('Apple identity token is missing. Please try signing in again.');
  }

  const credentialState = await appleAuth.getCredentialStateForUser(credential.user);

  if (credentialState !== appleAuth.State.AUTHORIZED) {
    throw new Error('Apple Sign-In was not authorized. Please try again.');
  }

  const tokenPayload = decodeJwtPayload(credential.identityToken);
  const email = credential.email ?? tokenPayload.email ?? '';
  const name = formatAppleName(credential.fullName) || email.split('@')[0] || 'Apple User';

  return {
    id: credential.user,
    email,
    name,
    identityToken: credential.identityToken,
    authorizationCode: credential.authorizationCode ?? '',
  };
}
