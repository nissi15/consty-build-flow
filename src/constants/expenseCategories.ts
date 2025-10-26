/**
 * Expense Category Color Mapping
 * 
 * This file defines consistent colors for each expense category across the application.
 * Each category always gets the same color regardless of where it appears.
 */

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  'Payroll': '#64748b',      // Slate
  'Materials': '#f97316',     // Orange
  'Equipment': '#22c55e',     // Green
  'Transport': '#3b82f6',     // Blue
  'Miscellaneous': '#a855f7', // Purple
  'Labor': '#06b6d4',         // Cyan
  'Supplies': '#eab308',      // Yellow
  'Utilities': '#ec4899',     // Pink
  'Maintenance': '#14b8a6',   // Teal
  'Other': '#8b5cf6',         // Violet
};

// Fallback colors for any categories not in the mapping above
export const FALLBACK_COLORS = [
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
];

/**
 * Get the color for a specific expense category
 * @param category The expense category name
 * @param fallbackIndex Optional index for fallback color selection
 * @returns The hex color code for the category
 */
export function getCategoryColor(category: string, fallbackIndex: number = 0): string {
  return EXPENSE_CATEGORY_COLORS[category] || FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}


