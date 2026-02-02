/**
 * Building-Image Matching Utilities
 * Matches image filenames to building titles using fuzzy matching
 */

import type { BuildingWithImage } from '@/types/building';

export interface MatchResult {
  building: BuildingWithImage | null;
  score: number;
  matchedPortion: string;
}

/**
 * Normalize text for comparison: lowercase, remove special chars, trim
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract meaningful name from filename (remove extension and common prefixes/suffixes)
 */
function extractNameFromFilename(filename: string): string {
  // Remove extension
  let name = filename.replace(/\.[^/.]+$/, '');

  // Remove common image naming patterns
  name = name
    .replace(/[-_]?(copy|final|v\d+|edit|edited|new|old|\d{4}[-_]?\d{2}[-_]?\d{2})$/i, '')
    .replace(/^(img|image|photo|pic|picture)[-_]?/i, '')
    .replace(/[-_]?\(\d+\)$/, '') // Remove (1), (2), etc.
    .replace(/[-_]\d+$/, ''); // Remove trailing numbers like -1, _2

  return name;
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses a combination of techniques for best results
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Check for exact substring match (partial match)
  if (s1.includes(s2) || s2.includes(s1)) {
    const shorter = s1.length < s2.length ? s1 : s2;
    const longer = s1.length >= s2.length ? s1 : s2;
    return shorter.length / longer.length;
  }

  // Check for word overlap
  const words1 = s1.split(' ').filter((w) => w.length > 2);
  const words2 = s2.split(' ').filter((w) => w.length > 2);

  if (words1.length > 0 && words2.length > 0) {
    let matchedWords = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matchedWords++;
          break;
        }
      }
    }

    if (matchedWords > 0) {
      return matchedWords / Math.max(words1.length, words2.length);
    }
  }

  // Levenshtein distance for fuzzy matching
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return Math.max(0, 1 - distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1, // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Find the best matching building for a given filename
 */
export function findBestMatch(filename: string, buildings: BuildingWithImage[], minScore: number = 0.3): MatchResult {
  const extractedName = extractNameFromFilename(filename);
  let bestMatch: BuildingWithImage | null = null;
  let bestScore = 0;
  let matchedPortion = '';

  for (const building of buildings) {
    const score = calculateSimilarity(extractedName, building.title);

    if (score > bestScore && score >= minScore) {
      bestScore = score;
      bestMatch = building;
      matchedPortion = building.title;
    }
  }

  return {
    building: bestMatch,
    score: bestScore,
    matchedPortion,
  };
}

/**
 * Match multiple files to buildings
 */
export function matchFilesToBuildings(files: File[], buildings: BuildingWithImage[]): Map<File, MatchResult> {
  const results = new Map<File, MatchResult>();

  for (const file of files) {
    results.set(file, findBestMatch(file.name, buildings));
  }

  return results;
}

/**
 * Search buildings by partial, case-insensitive query
 */
export function searchBuildings(
  query: string,
  buildings: BuildingWithImage[],
  limit: number = 10,
): BuildingWithImage[] {
  if (!query.trim()) {
    return buildings.slice(0, limit);
  }

  const normalizedQuery = normalizeText(query);

  const scored = buildings.map((building) => ({
    building,
    score: calculateSimilarity(normalizedQuery, building.title),
  }));

  return scored
    .filter((item) => item.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.building);
}
