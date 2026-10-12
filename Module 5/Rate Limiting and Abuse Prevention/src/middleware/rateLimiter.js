'use strict';
// middleware/rateLimiter.js
//
// Rate limiter middleware for authentication routes using express-rate-limit.
//
// Architecture / Multi-Instance Deployment Note:
// -----------------------------------------------------------------------------
// Why in-memory store fails across multiple instances behind a load balancer:
// The default `MemoryStore` keeps hit counters in local process memory (heap).
// In a production setup with N server instances running behind a reverse proxy / load balancer,
// incoming requests from an attacker are distributed across different nodes (e.g., via round-robin).
// Consequently, the attacker effectively gets N * max attempts before being throttled on any single node,
// defeating the rate limit and enabling distributed brute-force attacks. Furthermore, node restarts or autoscaling
// events reset all counters.
//
// How Redis (rate-limit-redis) replaces the in-memory store:
// To enforce consistent rate limits across all cluster nodes, `rate-limit-redis` can be passed to the `store` option:
//
//   const { RedisStore } = require('rate-limit-redis');
//   const { createClient } = require('redis');
//   const redisClient = createClient({ url: process.env.REDIS_URL });
//   await redisClient.connect();
//
//   const limiter = rateLimit({
//     store: new RedisStore({
//       sendCommand: (...args) => redisClient.sendCommand(args),
//     }),
//     windowMs: 15 * 60 * 1000,
//     max: 5,
//     ...
//   });
//
// Redis maintains shared, atomic, expiring keys across all application replicas, ensuring that an IP's
// attempts are accurately aggregated regardless of which server instance handles each request.
// -----------------------------------------------------------------------------

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  standardHeaders: true, // Return standard RateLimit-* headers (including Retry-After on 429)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skipSuccessfulRequests: true, // Only failed requests count against the limit
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts. Please try again later.',
    },
  },
});

module.exports = authLimiter;
