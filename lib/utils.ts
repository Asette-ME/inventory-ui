import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserInitials(name: string) {
  const words = name.split(' ');

  if (words.length === 1) return words[0][0].toUpperCase();

  // For multiple words, use first letter of first and last words
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function swapCoordinates(coords: any): any {
  // Base Case: If we hit a pair of numbers [56.27, 25.62]
  if (Array.isArray(coords) && coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    return [coords[1], coords[0]];
  }

  // Recursive Step: If it's an array of arrays, keep digging
  if (Array.isArray(coords)) {
    return coords.map((c) => swapCoordinates(c));
  }

  // Return as-is if it's just a number (though usually shouldn't happen here)
  return coords;
}

export function buildQueryString<T extends object>(params: T): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
}
