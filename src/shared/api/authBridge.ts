// src/shared/api/authBridge.ts

let signOutFn: (() => Promise<void>) | null = null;
let onLoggedOutNavigate: (() => void) | null = null;
let refreshBackendSessionFn: (() => Promise<string | null>) | null = null;

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
 * Register the function that refreshes the backend app JWT using Google auth.
 */
export function registerBackendSessionRefresh(fn: () => Promise<string | null>) {
  refreshBackendSessionFn = fn;
}

/**
 * Refresh the backend app JWT without forcing a full logout when possible.
 */
export async function refreshBackendSession() {
  if (!refreshBackendSessionFn) return null;
  return refreshBackendSessionFn();
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
