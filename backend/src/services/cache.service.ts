import IORedis from 'ioredis';
import { config } from '../config/env';

let redisClient: IORedis | null = null;
let isRedisConnected = false;

// Simple custom in-memory cache fallback to store key, value, and expiration time
interface IMemoryCacheEntry {
  value: string;
  expiresAt: number | null; // null represents infinite life
}
const memoryCache = new Map<string, IMemoryCacheEntry>();

// Initialize Redis Cache connection on module load
const redisUrl = config.REDIS_URL || 'redis://127.0.0.1:6379';
console.log(`Checking Redis cache connection at ${redisUrl}...`);

const testClient = new IORedis(redisUrl, {
  connectTimeout: 1500,
  maxRetriesPerRequest: 0,
});

testClient.once('ready', () => {
  isRedisConnected = true;
  redisClient = new IORedis(redisUrl);
  console.log('Redis cache server is active. Caching layer is enabled.');
  testClient.disconnect();
});

testClient.once('error', () => {
  isRedisConnected = false;
  console.warn('Redis cache connection failed. Falling back to in-memory local caching.');
  testClient.disconnect();
});

// Set value into cache
export async function setCache(key: string, data: any, ttlSeconds?: number): Promise<void> {
  const serialized = JSON.stringify(data);

  if (isRedisConnected && redisClient) {
    try {
      if (ttlSeconds) {
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, serialized);
      }
      return;
    } catch (err) {
      console.error(`Error writing to Redis cache for key [${key}]:`, err);
    }
  }

  // Local fallback
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  memoryCache.set(key, { value: serialized, expiresAt });
}

// Retrieve value from cache
export async function getCache<T>(key: string): Promise<T | null> {
  if (isRedisConnected && redisClient) {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (err) {
      console.error(`Error reading from Redis cache for key [${key}]:`, err);
    }
  }

  // Local fallback
  const entry = memoryCache.get(key);
  if (!entry) {
    return null;
  }

  // Check TTL expiration
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  try {
    return JSON.parse(entry.value) as T;
  } catch (err) {
    console.error(`Error parsing local memory cache value for key [${key}]:`, err);
    return null;
  }
}

// Delete specific key from cache
export async function delCache(key: string): Promise<void> {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (err) {
      console.error(`Error deleting Redis cache key [${key}]:`, err);
    }
  }

  // Local fallback
  memoryCache.delete(key);
}

// Clear matching caches based on entity ID or generic pattern
export async function invalidateAssignmentsCache(assignmentId?: string): Promise<void> {
  console.log('Invalidating assignments cache...');
  
  // 1. Invalidate global list cache
  await delCache('assignments:all');

  // 2. Invalidate detailed assignment page cache if specific ID provided
  if (assignmentId) {
    await delCache(`assignments:id:${assignmentId}`);
  }
}
