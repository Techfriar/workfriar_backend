import passport from 'passport';
import UserRepository from '../repositories/UserRepository'; // Import UserRepository
// import jwtService from '../services/jwt-servise';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints for authentication using Google OAuth.
 */
export default class AuthController {

    /**
     * @swagger
     * /auth/google-login:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Initiates Google OAuth login
     *     description: Redirects to Google OAuth page for authentication.
     *     responses:
     *       200:
     *         description: Successfully redirected to Google OAuth.
     *       500:
     *         description: Internal Server Error
     */
    async googleLogin(req, res, next) {
        try {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            const baseURL = `${protocol}://${host}`;

            passport.authenticate('google', {
                scope: ['email'], // Request only email scope
                callbackURL: `${baseURL}/auth/google-callback`,
            })(req, res, next);
        } catch (error) {
            console.error('Error in googleLogin:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    /**
     * @swagger
     * /auth/google-callback:
     *   get:
     *     tags:
     *       - Auth
     *     summary: Handles Google OAuth callback
     *     description: Processes Google OAuth callback, validates user, generates a token, and redirects the user.
     *     responses:
     *       302:
     *         description: Redirected to client with token.
     *       400:
     *         description: Authentication failed or user not authorized.
     *       500:
     *         description: Internal Server Error.
     */
    async googleCallback(req, res) {
        try {
            if (!req.user || !req.user.email) {
                return res.status(400).send('Authentication failed. No user email found.');
            }

            const email = req.user.email;

            // Check if user exists and if they are an admin using the repository
            const user = await UserRepository.findByEmail(email);
            if (!user) {
                return res.status(400).send('Authentication failed. User not found.');
            }

            // Check if the user is an admin
            const isAdmin = await UserRepository.isAdminByEmail(email);
            if (!isAdmin) {
                
                // Generate a JWT token for the user
                const token = req.user.token;

                const protocol = req.headers['x-forwarded-proto'] || req.protocol;
                const host = req.get('host');
                const origin = `${protocol}://${host}`;

                res.redirect(`${origin}/Login/?token=${token}`);
            }

            return res.status(403).send('Authentication failed. User is an admin.');

        } catch (error) {
            console.error('Error in googleCallback:', error);
            res.status(500).send('Authentication failed.');
        }
    }

    /**
     * @swagger
     * /auth/google-fallback:
     *   get:
     *     tags:
     *       - Auth
     *     summary: Fallback endpoint for Google OAuth
     *     description: Redirects to the login page if authentication fails.
     *     responses:
     *       302:
     *         description: Redirected to Login page.
     *       500:
     *         description: Internal Server Error.
     */
    async googleFallback(req, res) {
        try {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            const origin = `${protocol}://${host}`;

            res.redirect(`${origin}/Login`);
        } catch (error) {
            console.error('Error in googleFallback:', error);
            res.status(500).send('Fallback failed.');
        }
    }
}
