// utils/humanizeDate.ts
import { hasNotificationPermission } from '../../lib/notifications/NotificationPermissionPrompt';
import { parseISO, formatDistanceToNow, format, isBefore, isToday } from 'date-fns';
import { Dimensions } from 'react-native';

/**
 * Returns a relative string like "3 hours ago"
 *
 * @example
 * timeAgo('2025-05-24T12:34:56Z') // "3 hours ago"
 */
export function timeAgo(isoDate: string): string {
  const date = parseISO(isoDate);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Returns an absolute, human‐readable string like "May 15, 2025, 7:10 PM"
 *
 * @example
 * formatAbsolute('2025-05-15T19:10:00Z') // "May 15, 2025, 7:10 PM"
 */
export function formatAbsolute(isoDate: string): string {
  const date = parseISO(isoDate);
  return format(date, 'MMMM d, yyyy, h:mm a');
}

/**
 * Simple timeAgo function
 *
 * @example
 * simpleTimeAgo('2025-05-24T12:00:00Z') // "3 hr ago"
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
 *
 * @example
 * capitalizeFirstLetter('hello world') // "Hello world"
 */
export function capitalizeFirstLetter(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * AutoCapitalize whole word
 *
 * @example
 * capitalizeWords('hello world') // "Hello World"
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Converts hex color to rgba string
 *
 * @example
 * hexToRgba('#FF5733', 0.5) // "rgba(255, 87, 51, 0.5)"
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Creates a flattened array by repeating the given data a specified number of times.
 *
 * @example
 * repeatAndFlatten([1, 2]) // [1, 2, 1, 2, ..., repeated 12 times]
 */
export function repeatAndFlatten<T>(data: T): T[] {
  return Array(12).fill(data).flat();
}

/**
 * Gets device window width
 * @example
 * console.log(deviceWidth) // e.g. 390
 */
export const deviceWidth = Dimensions.get('window').width;

/**
 * Gets device window height
 * @example
 * console.log(deviceHeight) // e.g. 844
 */
export const deviceHeight = Dimensions.get('window').height;

/**
 * Checks if user has granted notification permission.
 *
 * @example
 * const hasPermission = await checkNotificationPermission();
 * if (!hasPermission) {
 *   // handle denied case
 * }
 */
export async function checkNotificationPermission(): Promise<boolean> {
  return await hasNotificationPermission();
}

// utils/getRemainingTime.ts

/**
 * Returns a readable string like "in 2 hours" or "Reminder time passed"
 */
export function getRemainingTime(remindAt: string | Date): string {
  const date = typeof remindAt === 'string' ? parseISO(remindAt) : remindAt;

  if (isBefore(date, new Date())) {
    return '⏰ Reminder time passed';
  }

  return `⏳ ${formatDistanceToNow(date, { addSuffix: true })}`;
}

export function formatReminderTime(isoDate: string): string {
  const date = parseISO(isoDate);
  const time = format(date, 'h:mm a'); // => "9:00 PM"

  if (isToday(date)) {
    return `Today at ${time}`;
  }

  return format(date, 'MMM d, yyyy • h:mm a'); // e.g., "Jun 1, 2025 • 9:00 PM"
}
