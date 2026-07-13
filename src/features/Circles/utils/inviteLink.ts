// In dev builds the shared invite link uses the custom scheme instead of the
// https universal link: local invites only exist in the local database, so
// the hosted landing page can't resolve them — but pushmeup://c/<token>
// opens the dev app on the other device directly (tap it from Notes/iMessage,
// or paste it into Safari's address bar).
export function toShareableInviteLink(inviteLink: string): string {
  if (!__DEV__) return inviteLink;
  return inviteLink.replace(/^https?:\/\/[^/]+\/c\//i, 'pushmeup://c/');
}

// Same dev/prod split for links straight to a circle's detail page.
export function toShareableCircleLink(circleId: string): string {
  if (__DEV__) return `pushmeup://circles/${circleId}`;
  return `https://pushmeup.app/circles/${circleId}`;
}
