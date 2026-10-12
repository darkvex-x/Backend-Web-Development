const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { serializeUser } = require('../utils/serializer');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await userRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('Email already in use');
    error.status = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const saltRounds = Number(process.env.BCRYPT_COST) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await userRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return serializeUser(newUser);
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

  return serializeUser(user);
}

module.exports = {
  normalizeEmail,
  registerUser,
  loginUser,
};
