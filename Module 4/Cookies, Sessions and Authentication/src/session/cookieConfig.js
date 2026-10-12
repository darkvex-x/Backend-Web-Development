const SESSION_COOKIE_NAME = 'sid';

function getSessionCookieOptions() {
  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  const ttlMs = Number(process.env.SESSION_TTL_MS) || 3600000;

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    signed: true,
    maxAge: ttlMs,
    path: '/',
  };
}

function getSessionCookieClearOptions() {
  const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    signed: true,
    path: '/',
  };
}

module.exports = {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  getSessionCookieClearOptions,
};
