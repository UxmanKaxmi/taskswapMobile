// The server replaces the owner id of anonymous goals with "anon:<taskId>".
// Such ids never resolve to a real profile, so navigation must not fire.
export function isAnonOwnerId(userId?: string | null): boolean {
  return typeof userId === 'string' && userId.startsWith('anon:');
}
