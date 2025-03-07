import UserRepository from '../../repositories/user-repository.js';
import passport from '../../config/passport-config.js'
import jwt from 'jsonwebtoken'
import jwtService from '../../utils/jwt-service.js';
import { isTokenBlacklisted } from '../../services/blackListToken.js';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints for authentication using Google OAuth.
 */
export default class  AuthController {

    /**
     * For handling errors
     * @param {*} res 
     * @param {*} message 
     * @param {*} status 
     * @returns 
     */
    static async handleError(res, message, status = 401) {
        return res.status(status).json({
            status: false,
            message: message,
            data: {token:null}
        });
    }

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

        let front_end_url = process.env.USER_FRONT_END_URL;
        
        let token = null
        let error = null

        try {

            if(!req.user) throw new Error('Authentication failed. User not found.');

            const email = req.user.email;
            const isAdmin = req.user.isAdmin;

            // Check if user is an admin
            if(isAdmin){
                const isValidAdmin = req.user.isAdmin || (await userRepo.isAdminByEmail(email));
                if (!isValidAdmin) {
                    throw new Error('Authentication failed. User is not an admin.');                
                }
                front_end_url = process.env.ADMIN_FRONT_END_URL
            }

            // Generate JWT token
            token = req.user.token;
       
        } catch (err) {
            console.error('Error in googleCallback:', error);
            error = err.message || 'Authentication failed.';
        }
        
        // Redirect to client with token
        return res.redirect(`${front_end_url}/${token?'?token='+token:''}${error?'?error='+error:''}`);

        // Prepare HTML for POST redirect
        // const html = `
        //     <html>
        //         <body>
        //             <form id="redirectForm" method="POST" action="${front_end_url}">
        //                 <input type="hidden" name="token" value="${token}">
        //                 <input type="hidden" name="error" value="${error}">
        //             </form>
        //             <script>
        //                 document.getElementById('redirectForm').submit();
        //             </script>
        //         </body>
        //     </html>
        // `;

        // Send HTML response for POST redirect
        // return res.send(html);
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
        const front_end_url = process.env.FRONT_END_URL;

        // Redirect to login page
        return res.redirect(`${front_end_url}/?error=Authentication failed!.`);

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
 *       302:
 *         description: Successfully logged out and redirected to login page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: URL of the login page
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

    /**
     * @swagger
     * /auth/verify-admin:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Verify admin status
     *     description: Verifies if the user is an admin based on the provided token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: string
     *                 description: JWT token for authentication
     *     responses:
     *       200:
     *         description: Admin verified successfully
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
     *                   example: Admin verified successfully
     *                 token:
     *                   type: string
     *                   description: The verified JWT token
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
     *                   example: Unauthorized
     *                 token:
     *                   type: string
     *                   example: null
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
     *                   example: Internal Server Error during admin verification.
     *                 token:
     *                   type: string
     *                   example: null
     */
    
    async verifyAdmin(req, res) {

        const userRepo = new UserRepository();

        try {
            let { token } = req.body;
            token = token.split(' ')[1]
                if (token) {
                    // if(await isTokenBlacklisted(token)) {
                    //     return handleError(res, 'Unauthorized', 401)
                    // }
        
                    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                        if (decoded) {
                            const { userId } = decoded
                            const user = await userRepo.getUserById(userId)
                            req.session.user = user
                            if (err || !decoded.isAdmin || !user.isAdmin) {
                                return AuthController.handleError(res, 'Unauthorized', 401)
                            }

                            return res.status(200).json({ 
                                status: true,
                                message: 'Admin verified successfully',
                                data: {token} 
                            });
                        } else {
                            return AuthController.handleError(res, 'Unauthorized', 401)
                        }
                    })
                } else {
                    return AuthController.handleError(res, 'Unauthorized', 401)
                }

        } catch (error) {
            console.error('Error in verifyAdmin:', error);
            return AuthController.handleError(res, 'Internal Server Error during admin verification.', 500);
        }
    }

    /**
     * @swagger
     * /auth/verify-user:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Verify user status
     *     description: Verifies if the user is valid based on the provided token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               token:
     *                 type: string
     *                 description: JWT token for authentication
     *     responses:
     *       200:
     *         description: User verified successfully
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
     *                   example: User verified successfully
     *                 token:
     *                   type: string
     *                   description: The verified JWT token
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
     *                   example: Unauthorized
     *                 token:
     *                   type: string
     *                   example: null
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
     *                   example: Internal Server Error during user verification.
     *                 token:
     *                   type: string
     *                   example: null
     */
    async verifyUser(req, res) {

        const userRepo = new UserRepository();

        try {
            let { token } = req.body;
            token = token.split(' ')[1]
                if (token) {
                    // if(await isTokenBlacklisted(token)) {
                    //     return handleError(res, 'Unauthorized', 401)
                    // }

                    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
                        if (decoded) {
                            const { userId } = decoded
                            const user = await userRepo.getUserById(userId)
                            req.session.user = user
                            if(err) {
                                return AuthController.handleError(res, 'Unauthorized', 401)
                            }

                            return res.status(200).json({
                                status: true,
                                message: 'User verified successfully',
                                data: {token}
                            });
                            
                        } else {
                            return AuthController.handleError(res, 'Unauthorized', 401)
                        }
                    })
                } else {
                    return AuthController.handleError(res, 'Unauthorized', 401)
                }

            
        } catch (error) {
            console.error('Error in verifyUser:', error);
            return AuthController.handleError(res, 'Internal Server Error during user verification.', 500);
        }
    }  
    
    /**
     * @swagger
     * /auth/login-with-password:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Login with email and password
     *     description: Authenticates user with email and password and returns a JWT token.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 description: User's email
     *               password:
     *                 type: string
     *                 description: User's password
     *     responses:
     *       200:
     *         description: Login successful
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
     *                   example: Login successful
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                       description: JWT token
     *       400:
     *         description: Email and password are required
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
     *                   example: Email and password are required
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                       example: null
     *       401:
     *         description: Invalid email or password
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
     *                   example: Invalid email or password
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                       example: null
     *       500:
     *         description: Internal Server Error during login
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
     *                   example: Internal Server Error during login
     *                 data:
     *                   type: object
     *                   properties:
     *                     token:
     *                       type: string
     *                       example: null
     */
    async loginWithPassword(req, res) {
        const userRepo = new UserRepository();
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return AuthController.handleError(res, 'Email and password are required', 400);
            }
            const user = await userRepo.getUserByEmail(email);
            if (!user) {
                return AuthController.handleError(res, 'Invalid email or password', 401);
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return AuthController.handleError(res, 'Invalid email or password', 401);
            }
            // Generate a JWT token
            const token = jwtService.createToken({
                email: user.email,
                userId: user._id,
                isAdmin: user.isAdmin,
            });
            return res.status(200).json({
                status: true,
                message: 'Login successful',
                data: { token }
            });
        } catch (error) {
            return AuthController.handleError(res, 'Internal Server Error during login.', 500);
        }
    }
   
}
