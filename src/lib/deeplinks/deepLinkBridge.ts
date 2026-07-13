import { Linking } from 'react-native';
import { enqueueNotificationRoute } from '../notifications/notificationNavigation';
import type { NotificationRoute } from '../notifications/notificationRoutes';

// Deep-link entry points:
//   https://pushmeup.app/c/<token>      → JoinCircle (invite landing)
//   https://pushmeup.app/circles/<id>   → CircleDetail
//   pushmeup://c/<token>, pushmeup://circles/<id> — same routes via the
//   custom scheme, which needs no AASA/assetlinks and so works in local dev
//   (simctl openurl / adb am start).
// Routed through the notification pending-route machinery so cold starts and
// signed-out states behave exactly like notification taps.

const AUTH_COPY_CIRCLE = {
  title: 'Open Your Circle',
  subtitle: "Log in to see how everyone's doing and push them forward.",
  cta: 'Log In to View',
};

function getPathFromUrl(url: string): string | null {
  // React Native's URL implementation is incomplete (pathname throws), so
  // extract the path with regexes instead.
  const httpsMatch = url.match(/^https?:\/\/[^/]+(\/[^?#]*)/i);
  if (httpsMatch) return httpsMatch[1];

  // Custom scheme has no host: everything after :// is the path.
  const schemeMatch = url.match(/^pushmeup:\/\/([^?#]+)/i);
  if (schemeMatch) return `/${schemeMatch[1]}`;

  return null;
}

export function getRouteForDeepLinkUrl(url: string): NotificationRoute | null {
  const path = getPathFromUrl(url);
  if (!path) return null;

  const inviteMatch = path.match(/^\/c\/([^/?#]+)/i);
  if (inviteMatch) {
    return {
      screen: 'JoinCircle',
      params: { token: inviteMatch[1] },
      authCopy: AUTH_COPY_CIRCLE,
    };
  }

  const circleMatch = path.match(/^\/circles\/([^/?#]+)/i);
  if (circleMatch) {
    return {
      screen: 'CircleDetail',
      params: { circleId: circleMatch[1] },
      authCopy: AUTH_COPY_CIRCLE,
    };
  }

  return null;
}

function handleUrl(url: string | null) {
  if (!url) return;

  const route = getRouteForDeepLinkUrl(url);
  if (!route) return;

  enqueueNotificationRoute(route);
}

export function initDeepLinks(): () => void {
  // Cold start: the URL that launched the app.
  Linking.getInitialURL()
    .then(handleUrl)
    .catch(() => {});

  // Warm start: links tapped while the app is running.
  const subscription = Linking.addEventListener('url', event => handleUrl(event.url));

  return () => subscription.remove();
}
