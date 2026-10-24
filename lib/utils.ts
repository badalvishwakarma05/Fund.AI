import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string for display with "Last verified" context.
 */
export function formatVerifiedDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1).trimEnd() + '…';
}

/**
 * Format currency in Indian numbering system (lakhs/crores).
 */
export function formatINR(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
  }
  if (amount >= 100_000) {
    return `₹${(amount / 100_000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Verdict color helpers.
 */
export type Verdict = 'MET' | 'NOT_MET' | 'UNKNOWN';

export function verdictColor(verdict: Verdict) {
  switch (verdict) {
    case 'MET':     return { bg: 'bg-met-50 dark:bg-met-500/10', text: 'text-met-600 dark:text-met-400', border: 'border-met-200 dark:border-met-500/20' };
    case 'NOT_MET': return { bg: 'bg-notmet-50 dark:bg-notmet-500/10', text: 'text-notmet-600 dark:text-notmet-400', border: 'border-notmet-200 dark:border-notmet-500/20' };
    case 'UNKNOWN': return { bg: 'bg-unknown-50 dark:bg-unknown-500/10', text: 'text-unknown-600 dark:text-unknown-400', border: 'border-unknown-200 dark:border-unknown-500/20' };
  }
}

export function verdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case 'MET':     return 'Met';
    case 'NOT_MET': return 'Not Met';
    case 'UNKNOWN': return 'Unknown';
  }
}
