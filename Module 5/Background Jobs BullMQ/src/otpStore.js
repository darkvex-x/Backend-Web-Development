'use strict';

const crypto = require('crypto');

const store = new Map();

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function storeOTP(email, otp) {
  store.set(email, {
    otp: String(otp),
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });
}

function verifyOTP(email, code) {
  const entry = store.get(email);

  // 1. Not found
  if (!entry) {
    return { ok: false, reason: 'not_found' };
  }

  // 2. Expired
  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    return { ok: false, reason: 'expired' };
  }

  // 3. Too many attempts (>= 3)
  if (entry.attempts >= 3) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  // 4. Wrong code
  if (String(entry.otp) !== String(code)) {
    entry.attempts += 1;
    return { ok: false, reason: 'wrong_code' };
  }

  // 5. Correct
  store.delete(email);
  return { ok: true };
}

function markVerified(email) {
  console.log(`[otpStore] Verified email: ${email}`);
}

function _storeForTest(email, data) {
  store.set(email, data);
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  markVerified,
  _store: store,
  _storeForTest,
};
