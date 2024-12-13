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
    .get( passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google-fallback' }), auth.googleCallback )

authRouter
    .route('/google-fallback')
    .get(auth.googleFallback)

/**
 * logout route
  */
authRouter
    .route('/logout')
    .post(auth.logout)

export default authRouter