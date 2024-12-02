import express from 'express'

import passport from 'passport'
import AuthController from '../controllers/auth/auth-controller.js'

const authRouter = express.Router()

const auth = new AuthController()

/*
 * Auth Routes
 */

authRouter
    .route('/google-login')
    .get( auth.googleLogin )

authRouter
    .route('/google-callback')
    .get( passport.authenticate('google', { session: false }), auth.googleCallback )

authRouter
    .route('/google-fallback')
    .get(auth.googleFallback)

export default authRouter