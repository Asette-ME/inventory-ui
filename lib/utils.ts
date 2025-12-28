import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserInitials(name: string) {
  const words = name.split(" ");

  if (words.length === 1) return words[0][0].toUpperCase();

  // For multiple words, use first letter of first and last words
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}