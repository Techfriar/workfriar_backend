import passport from 'passport';
import dotenv from 'dotenv';
import googleStrategy from 'passport-google-oauth20';
import jwtService from '../utils/jwt-service.js';
import UserRepository from '../repositories/user-repository.js';

dotenv.config();

const GoogleStrategy = googleStrategy.Strategy;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BACK_END_URL = process.env.CALL_BACK_URL

passport.use(
    new GoogleStrategy(
        {
            clientID: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            callbackURL: BACK_END_URL, // Match callback route
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            const userRepo = new UserRepository();
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    console.log('No email found in profile');
                    return done(null, false, { message: 'No email found in profile' });
                }

                const user = await userRepo.getUserByEmail(email);
                if (!user) {
                    console.log('User not found');
                    return done(null, false, { message: 'User not found' });
                }

                // Generate a JWT token
                const token = jwtService.createToken({
                    email: user.email,
                    userId: user._id,
                    isAdmin: user.isAdmin,
                });

                return done(null, { email: user.email, isAdmin: user.isAdmin, token });
            } catch (error) {
                console.error('Error in Google strategy:', error);
                done(error, false);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
