// Date utility functions for Rwanda timezone (UTC+2)

/**
 * Get current date in Rwanda timezone (UTC+2 / CAT - Central Africa Time)
 * Returns date string in YYYY-MM-DD format
 */
export function getTodayInRwanda(): string {
  const now = new Date();
  // Convert to Rwanda timezone (UTC+2)
  const rwandaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
  
  const year = rwandaTime.getFullYear();
  const month = String(rwandaTime.getMonth() + 1).padStart(2, '0');
  const day = String(rwandaTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get current date and time in Rwanda timezone
 */
export function getNowInRwanda(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
}

/**
 * Format a date in Rwanda timezone
 */
export function formatDateInRwanda(date: Date, formatStr: string = 'YYYY-MM-DD'): string {
  const rwandaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Kigali' }));
  
  const year = rwandaDate.getFullYear();
  const month = String(rwandaDate.getMonth() + 1).padStart(2, '0');
  const day = String(rwandaDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

