// src/shared/api/authBridge.ts

let signOutFn: (() => Promise<void>) | null = null;
let onLoggedOutNavigate: (() => void) | null = null;

/**
 * Register the function that performs the logout.
 */
export function registerSignOut(fn: () => Promise<void>) {
  signOutFn = fn;
}

/**
 * Register the navigation callback to run AFTER logout is complete.
 */
export function registerPostLogoutNavigation(cb: () => void) {
  onLoggedOutNavigate = cb;
}

/**
 * Run logout logic + navigation.
 */
export async function triggerLogout() {
  if (signOutFn) {
    await signOutFn(); // clears auth, async storage, tokens
  }

  if (onLoggedOutNavigate) {
    onLoggedOutNavigate(); // resets navigation
  }
}
