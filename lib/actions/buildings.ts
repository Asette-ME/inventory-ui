'use server';

import { Building } from '@/types/building';

export async function fetchBuildingsAction(): Promise<Building[]> {
  const apiKey = process.env.ASETTE_BE_API_KEY;

  if (!apiKey) {
    console.error('ASETTE_BE_API_KEY is not defined');
    return [];
  }

  try {
    const res = await fetch(`${process.env.ASETTE_BE_API_URL}/buildings/?skip=0&limit=1000`, {
      headers: { 'x-api-key': apiKey },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Failed to fetch buildings:', res.status, await res.text());
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }
}
