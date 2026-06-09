import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const customTwMerge = extendTailwindMerge({
  // Extend tailwind merge if needed
})

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs))
}
