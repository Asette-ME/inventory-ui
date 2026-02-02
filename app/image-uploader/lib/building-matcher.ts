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

  // Remove common image naming patterns (only when preceded by separator)
  name = name
    .replace(/[-_](copy|final|v\d+|edited|new|old)$/i, '') // Only with separator prefix
    .replace(/[-_]?\d{4}[-_]?\d{2}[-_]?\d{2}$/i, '') // Date patterns
    .replace(/^(img|image|photo|pic|picture|small|large|thumb|thumbnail)[-_\s]+/i, '') // Common prefixes
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

  // Determine which is the filename (longer) and which is the building name (shorter)
  const filename = s1.length >= s2.length ? s1 : s2;
  const buildingName = s1.length < s2.length ? s1 : s2;

  // Check if the building name is fully contained in the filename
  // This should give a HIGH score because it's likely the correct match
  if (filename.includes(buildingName)) {
    // Give high score (0.8-1.0) based on how much of the filename is the building name
    // If building name is "the edit" and filename is "meraas the edit", this is a strong match
    const ratio = buildingName.length / filename.length;
    return 0.8 + ratio * 0.2; // Score between 0.8 and 1.0
  }

  // Check for word-based matching
  const words1 = s1.split(' ').filter((w) => w.length > 1);
  const words2 = s2.split(' ').filter((w) => w.length > 1);

  if (words1.length > 0 && words2.length > 0) {
    // Check if ALL words from the shorter string are in the longer string
    const shorterWords = words1.length <= words2.length ? words1 : words2;
    const longerWords = words1.length > words2.length ? words1 : words2;

    let exactMatches = 0;
    let partialMatches = 0;

    for (const shortWord of shorterWords) {
      let matched = false;
      for (const longWord of longerWords) {
        if (shortWord === longWord) {
          exactMatches++;
          matched = true;
          break;
        } else if (longWord.includes(shortWord) || shortWord.includes(longWord)) {
          partialMatches++;
          matched = true;
          break;
        }
      }
    }

    // If all words from building name are found in filename, it's a strong match
    if (exactMatches === shorterWords.length) {
      return 0.85 + (exactMatches / longerWords.length) * 0.15;
    }

    // Partial word matches
    const totalMatches = exactMatches + partialMatches * 0.5;
    if (totalMatches > 0) {
      return (totalMatches / shorterWords.length) * 0.7;
    }
  }

  // Levenshtein distance for fuzzy matching (fallback)
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  return Math.max(0, (1 - distance / maxLength) * 0.5); // Cap at 0.5 for fuzzy matches
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
