const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const requireSession = require('../middleware/requireSession');
const {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  getSessionCookieClearOptions,
} = require('../session/cookieConfig');

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      email.trim() === '' ||
      typeof password !== 'string' ||
      password === ''
    ) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'email and password are required and must be non-empty strings',
        },
      });
    }

    const { sessionId, user } = await authService.loginUser({ email, password });

    res.cookie(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions());

    return res.status(200).json(user);
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }
    return next(error);
  }
});

router.get('/me', requireSession, async (req, res) => {
  return res.status(200).json(req.user);
});

router.post('/logout', async (req, res, next) => {
  try {
    const sessionId = req.signedCookies && req.signedCookies.sid;
    if (sessionId) {
      authService.logoutUser(sessionId);
    }

    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieClearOptions());

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
