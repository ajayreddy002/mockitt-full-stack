/**
 * Format a date to a relative time string using modern Intl.RelativeTimeFormat API
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'en')
 * @returns A human-readable relative time string like "5 minutes ago"
 */
export const formatRelativeTime = (date: Date | string, locale: string = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Array representing time units in seconds[4]
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

  // Handle immediate cases
  if (diffInSeconds < 5) {
    return 'just now';
  }

  // Find the ideal cutoff unit[4]
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(diffInSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Use Intl.RelativeTimeFormat for localized formatting[1][3][5]
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return rtf.format(-Math.floor(diffInSeconds / divisor), units[unitIndex]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Fallback for unsupported browsers
    return fallbackRelativeTime(diffInSeconds);
  }
};

/**
 * Fallback implementation for browsers without Intl.RelativeTimeFormat support
 */
const fallbackRelativeTime = (diffInSeconds: number): string => {
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
};

/**
 * Format a date for display in dashboard contexts
 */
export const formatDashboardDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // For recent dates (within 7 days), show relative time
  const daysDiff = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 7) {
    return formatRelativeTime(dateObj);
  }
  
  // For older dates, show absolute date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
