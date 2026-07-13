import { differenceInCalendarDays, isValid, parseISO } from 'date-fns';

// "DAY N" = calendar days since the member's task was created (day 1 =
// creation day) — same derivation as the home summary so surfaces agree.
export function getCircleDayNumber(createdAt?: string | null) {
  if (!createdAt) return 1;

  const parsed = parseISO(createdAt);
  if (isValid(parsed)) {
    return Math.max(1, differenceInCalendarDays(new Date(), parsed) + 1);
  }

  return 1;
}
