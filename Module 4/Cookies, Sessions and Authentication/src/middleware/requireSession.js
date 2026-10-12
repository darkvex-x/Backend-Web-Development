const sessionStore = require('../session/sessionStore');
const userRepository = require('../repositories/userRepository');
const { serializeUser } = require('../utils/serializer');

async function requireSession(req, res, next) {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;
    if (!sessionId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired session',
        },
      });
    }

    const user = await userRepository.findUserById(session.userId);
    if (!user) {
      // Orphaned session - clean up
      sessionStore.destroy(sessionId);
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User no longer exists',
        },
      });
    }

    req.sessionId = sessionId;
    req.user = serializeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireSession;
