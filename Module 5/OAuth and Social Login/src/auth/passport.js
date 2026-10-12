'use strict';
// auth/passport.js — Google OAuth strategy

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { users, nextId } = require('../data');

// ─── verifyCallback ────────────────────────────────────────────────────────────
// Three scenarios to handle, in this exact order:
//
//   1. RETURNING OAuth user
//      Find a user in `users` whose googleId === profile.id.
//      If found → call done(null, user).
//
//   2. EXISTING local account (first-time Google login)
//      Find a user in `users` whose email === profile.emails[0].value.
//      If found AND profile._json.email_verified is true:
//        Set user.googleId = profile.id (link the account)
//        Call done(null, user).
//      If found but email NOT verified:
//        Call done(null, false) — reject to prevent account hijacking.
//
//   3. BRAND-NEW user
//      No match at all. Build a new user object:
//        { id: nextId(), googleId: profile.id, email, name, role: 'member' }
//      Push it into `users`.
//      Call done(null, newUser).
// ───────────────────────────────────────────────────────────────────────────────
async function verifyCallback(accessToken, refreshToken, profile, done) {
  try {
    const googleId = profile?.id;
    const email = profile?.emails?.[0]?.value;
    const displayName = profile?.displayName;
    const isEmailVerified = Boolean(profile?._json?.email_verified);

    // 1. Check returning OAuth user by googleId
    const existingOAuthUser = users.find((u) => u.googleId === googleId);
    if (existingOAuthUser) {
      return done(null, existingOAuthUser);
    }

    // 2. Check existing local account by email
    const existingEmailUser = users.find((u) => u.email === email);
    if (existingEmailUser) {
      if (isEmailVerified) {
        existingEmailUser.googleId = googleId;
        return done(null, existingEmailUser);
      }
      // Unverified email: reject to prevent account takeover
      return done(null, false);
    }

    // 3. Brand-new user
    const newUser = {
      id: nextId(),
      googleId,
      email,
      name: displayName,
      role: 'member',
    };
    users.push(newUser);
    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID     || 'test-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'test-client-secret',
      callbackURL:  '/auth/google/callback',
    },
    verifyCallback,
  ),
);

// verifyCallback is exported so tests can call it directly without a real browser.
module.exports = { passport, verifyCallback };
