const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const { serializeUser } = require('../utils/serializer');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const user = await userRepository.findUserByEmail(normalizedEmail);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const ttlMs = Number(process.env.SESSION_TTL_MS) || 3600000;
  const sessionId = sessionStore.create(user.id, ttlMs);

  return {
    sessionId,
    user: serializeUser(user),
  };
}

function logoutUser(sessionId) {
  if (sessionId) {
    sessionStore.destroy(sessionId);
  }
}

module.exports = {
  normalizeEmail,
  loginUser,
  logoutUser,
};
