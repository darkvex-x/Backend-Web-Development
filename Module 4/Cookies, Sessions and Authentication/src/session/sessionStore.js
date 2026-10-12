const crypto = require('crypto');

/**
 * In-memory session store.
 * Suitable for learning/local execution only.
 * Production requires a shared, expiring store such as Redis or a dedicated database table.
 */
class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  create(userId, ttlMs = 3600000) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + ttlMs;
    this.sessions.set(sessionId, { userId, expiresAt });
    return sessionId;
  }

  get(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      return null;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  destroy(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }
    return this.sessions.delete(sessionId);
  }

  clear() {
    this.sessions.clear();
  }
}

module.exports = new SessionStore();
