let signOutFn: (() => Promise<void>) | null = null;

export function registerSignOut(fn: () => Promise<void>) {
  signOutFn = fn;
}

export function getSignOut() {
  return signOutFn;
}
