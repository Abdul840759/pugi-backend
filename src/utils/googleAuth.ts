import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

export function setupGoogleAuth() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('No email from Google'));

      let user = await User.findOne({ email });
      let isNewUser = false;

      if (user) {
        // Existing user - mark as verified
        user.emailVerified = true;
        user.isVerified = true;
        if (!user.avatar && profile.photos?.[0]?.value) {
          user.avatar = profile.photos[0].value;
        }
        await user.save();
      } else {
        // New user - create without verifying yet
        isNewUser = true;
        user = await User.create({
          name: profile.displayName || email.split('@')[0],
          email,
          password: Math.random().toString(36),
          role: 'learner',
          approved: true,
          emailVerified: false,
          isVerified: false,
          avatar: profile.photos?.[0]?.value || undefined,
        });
      }

      // Attach isNewUser flag so the callback route can check it
      (user as any).isNewUser = isNewUser;
      return done(null, user as any);
    } catch (err) {
      return done(err);
    }
  }));
}
