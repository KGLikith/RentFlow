import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  try {
    const cached = await redis.get(key)
    if (cached) {
      return JSON.parse(cached as string) as T
    }
  } catch (error) {
    console.warn(`Redis GET error for key ${key}:`, error)
  }

  try {
    const data = await fetchFn()

    try {
      await redis.setex(
        key,
        ttlSeconds,
        JSON.stringify(data)
      )
    } catch (error) {
      console.warn(`Redis SET error for key ${key}:`, error)
    }

    return data
  } catch (error) {
    console.log(`Error fetching data for key ${key}:`, error)
    throw error
  }
}

export async function invalidateCache(keys: string | string[]): Promise<void> {
  try {
    const keyArray = Array.isArray(keys) ? keys : [keys]

    for (const key of keyArray) {
      await redis.del(key)
    }
  } catch (error) {
    console.warn(`Error invalidating cache:`, error)
  }
}

export async function invalidateCachePattern(
  prefix: string,
  suffixes: string[] = []
): Promise<void> {
  try {
    const keys = suffixes.length > 0
      ? suffixes.map(suffix => `${prefix}:${suffix}`)
      : [`${prefix}*`]

    await invalidateCache(keys)
  } catch (error) {
    console.warn(`Error invalidating cache pattern ${prefix}:`, error)
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    console.warn('Clearing all cache should only be done in development')
  } catch (error) {
    console.log('Error clearing cache:', error)
  }
}
