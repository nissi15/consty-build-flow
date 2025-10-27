import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency with commas
 * @param amount - The number to format
 * @param currency - Currency symbol (default: 'RWF')
 * @returns Formatted currency string (e.g., "RWF 10,000")
 */
export function formatCurrency(amount: number | string, currency: string = 'RWF'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${currency} 0`;
  return `${currency} ${numAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * Format a number with commas (no currency symbol)
 * @param amount - The number to format
 * @returns Formatted number string (e.g., "10,000")
 */
export function formatNumber(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '0';
  return numAmount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header]?.toString() || '';
        // Escape quotes and wrap in quotes if contains comma
        return cell.includes(',') ? `"${cell.replace(/"/g, '""')}"` : cell;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}