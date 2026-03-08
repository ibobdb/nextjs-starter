import prisma from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

/**
 * Internal function to fetch config from DB with Next.js Data Cache.
 */
const getSystemConfigCached = unstable_cache(
  async (key: string, fallbackValue?: string) => {
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { key },
      });
      const val = config ? config.value : fallbackValue;
      return val;
    } catch (error) {
      console.error(`Error fetching SystemConfig for key ${key}:`, error);
      return fallbackValue;
    }
  },
  ['system-config'], // Base tag
  { 
    tags: ['system-config'], 
    revalidate: 3600
  } 
);

/**
 * Fetch a specific system configuration value.
 * Uses React.cache for per-request memoization and unstable_cache for cross-request caching.
 */
export const getSystemConfig = cache(async (key: string, fallbackValue?: string) => {
  return getSystemConfigCached(key, fallbackValue);
});

/**
 * Fetch all system configurations.
 * Mainly used for the dashboard settings page.
 */
export async function getAllSystemConfigs() {
  try {
    return await prisma.systemConfig.findMany({
      orderBy: { key: 'asc' }
    });
  } catch (error) {
    console.error(`Error fetching all SystemConfigs:`, error);
    return [];
  }
}
