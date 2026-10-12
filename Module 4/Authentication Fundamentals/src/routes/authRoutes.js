const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== 'string' ||
      name.trim() === '' ||
      typeof email !== 'string' ||
      email.trim() === '' ||
      typeof password !== 'string' ||
      password === ''
    ) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name, email, and password are required and must be non-empty strings',
        },
      });
    }

    const user = await authService.registerUser({ name, email, password });
    return res.status(201).json(user);
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: error.message,
        },
      });
    }
    return next(error);
  }
});

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

    const user = await authService.loginUser({ email, password });
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

module.exports = router;
