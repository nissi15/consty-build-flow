import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRWF(amount: number | string | null | undefined): string {
  const numeric = Number(amount || 0);
  return `RWF ${numeric.toLocaleString()}`;
}
