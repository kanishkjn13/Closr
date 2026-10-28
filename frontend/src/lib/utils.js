import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/**
 * Combines Tailwind classes cleanly and resolves conflicts.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
/**
 * Formats a date string or Date object into human-friendly format (e.g. "Thu, 29 Oct 2026")
 */
export function formatDate(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
/**
 * Formats time (e.g. "5:30 PM")
 */
export function formatTime(time) {
    return time;
}
/**
 * Generates initials from full name (e.g. "Dr. Sharma" -> "DS", "Rohit Verma" -> "RV")
 */
export function getInitials(name) {
    if (!name)
        return '';
    const cleanName = name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '');
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
