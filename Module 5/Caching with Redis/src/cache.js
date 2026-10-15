'use strict';

// ─── YOUR FILE — implement this ───────────────────────────────────────────────
// Implement three Redis helper functions using ioredis.

const Redis = require('ioredis');

const host = process.env.REDIS_HOST || '127.0.0.1';
const redis = new Redis({
  host: host === 'localhost' ? '127.0.0.1' : host,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
});

redis.on('error', (err) => {
  console.error('[Redis error]', err.message);
});

/**
 * Retrieves and deserializes a cached value.
 * On miss or error, returns null for graceful fallback to database.
 * @param {string} key
 * @returns {Promise<any | null>}
 */
async function cacheGet(key) {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[cacheGet error for key "${key}"]`, err.message);
    return null;
  }
}

/**
 * Serializes and stores a value in Redis with TTL.
 * @param {string} key
 * @param {any} data
 * @param {number} ttlSeconds
 * @returns {Promise<void>}
 */
async function cacheSet(key, data, ttlSeconds) {
  try {
    if (ttlSeconds) {
      await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    } else {
      await redis.set(key, JSON.stringify(data));
    }
  } catch (err) {
    console.error(`[cacheSet error for key "${key}"]`, err.message);
  }
}

/**
 * Removes a key from the cache.
 * @param {string} key
 * @returns {Promise<void>}
 */
async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`[cacheDel error for key "${key}"]`, err.message);
  }
}

module.exports = { cacheGet, cacheSet, cacheDel, redis };
