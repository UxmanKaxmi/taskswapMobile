// utils/humanizeDate.ts
import { parseISO, formatDistanceToNow, format } from 'date-fns';

/**
 * Returns a relative string like "3 hours ago"
 */
export function timeAgo(isoDate: string): string {
  const date = parseISO(isoDate);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Returns an absolute, human‐readable string like "May 15, 2025, 7:10 PM"
 */
export function formatAbsolute(isoDate: string): string {
  const date = parseISO(isoDate);
  return format(date, 'MMMM d, yyyy, h:mm a');
}

/**
 * Simple timeAgo function
 */
export function simpleTimeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = Math.floor((now - then) / 1000); // seconds

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day${diff >= 172800 ? 's' : ''} ago`;
}

/**
 * AutoCapitalize first letter
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * AutoCapitalize whole word
 */

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}
