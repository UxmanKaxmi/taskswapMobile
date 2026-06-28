// Deterministic avatar background colors for initials-only avatars.
// Shared across the app so the same user always gets the same color.
export const AVATAR_COLORS = ['#FFD23F', '#A8C6F6', '#F4B8C6', '#A8E1D7', '#D7B8FF'];

/**
 * Pick a stable avatar color from a seed (prefer a user id so the same person
 * is the same color everywhere; fall back to their name).
 */
export function getAvatarColor(seed?: string | null) {
  const key = (seed ?? '').trim();
  const value = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[value % AVATAR_COLORS.length];
}
