import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | Date): string {
  try {
    const date = typeof value === "string" ? new Date(value) : value
    if (isNaN(date.getTime())) {
      return "Invalid date"
    }
    return date.toLocaleString()
  } catch {
    return "Invalid date"
  }
}

export function formatCost(value: number): string {
  return `$${Math.abs(value).toFixed(4)}`
}

export function formatTokens(input: number, output: number): string {
  return `${input} in / ${output} out`
}
