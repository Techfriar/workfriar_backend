import UserRepository from '../../repositories/user-repository.js';
import passport from '../../config/passport-config.js'


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
     *   get:
     *     tags:
     *       - Auth
     *     summary: Initiates Google OAuth login
     *     description: Redirects user to Google OAuth for authentication.
     *     responses:
     *       302:
     *         description: Redirected to Google's OAuth page.
     *       500:
     *         description: Internal Server Error.
     */
    googleLogin = passport.authenticate('google', { scope: ['email'] });

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
        const userRepo = new UserRepository();

        try {
            const email = req.user?.email;
            const isAdmin = req.user?.isAdmin;

            if (!email) {
                return res.status(400).json({ message: 'Authentication failed. No user email found.' });
            }

            // Check if user exists
            const user = await userRepo.getUserByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Authentication failed. User not found.' });
            }

            // Check if user is an admin
            if(isAdmin){
                const isValidAdmin = user.isAdmin || (await userRepo.isAdminByEmail(email));
                if (!isValidAdmin) {
                    return res.status(403).json({ message: 'Authentication failed. User is not an admin.' });
                }
            }

            // Generate JWT token
            const token = req.user.token;

            // Determine origin dynamically
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            const origin = `${protocol}://${host}`;

            // Redirect to client with token
            return res.redirect(`${origin}/Login/?token=${token}`);
        } catch (error) {
            console.error('Error in googleCallback:', error);
            return res.status(500).json({ message: 'Internal Server Error during authentication.' });
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

            return res.redirect(`${origin}/Login?error=auth_failed`);
        } catch (error) {
            console.error('Error in googleFallback:', error);
            return res.status(500).json({ message: 'Internal Server Error during fallback.' });
        }
    }
    
    /**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout user
 *     description: Invalidates the user's token by adding it to a blacklist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Successfully logged out"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No token provided or invalid token"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "An error occurred during logout"
 */
    async logout(req, res) {
        try {
            req.session.destroy();
            const authHeader = req.headers['authorization']
            if (!authHeader) {
                return res.status(401).json({ message: 'Unauthorized' })
            } else {
                const token = authHeader.split(' ')[1]
                if (!token) {
                    return res.status(401).json({ message: 'Unauthorized' })
                }

                blacklistToken(token, '1d')
            }

            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            const origin = `${protocol}://${host}`;

            return res.redirect(`${origin}/Login`);
        } catch (error) {
            console.error('Error in logout:', error);
            return res.status(500).json({ message: 'Internal Server Error during logout.' });
        }
    }
}
