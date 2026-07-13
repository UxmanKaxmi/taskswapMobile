import { getFirstName } from '@shared/utils/helperFunctions';

// "Usman, Hina & Adnan" — the human roster line used on the circle detail
// header and the invite/join screens.
export function formatRoster(names: string[]) {
  const firsts = names.map(getFirstName).filter(Boolean);
  if (firsts.length === 0) return '';
  if (firsts.length === 1) return firsts[0];
  return `${firsts.slice(0, -1).join(', ')} & ${firsts[firsts.length - 1]}`;
}
