import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatPackage(lpa: number): string {
  return `₹${lpa} LPA`
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Truncate text
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Get status color
export function getStatusColor(status: string): string {
  const colors = {
    pending: 'badge-warning',
    shortlisted: 'badge-info',
    selected: 'badge-success',
    rejected: 'badge-error',
    upcoming: 'badge-info',
    ongoing: 'badge-warning',
    completed: 'badge-success'
  }
  return colors[status as keyof typeof colors] || 'badge-info'
}