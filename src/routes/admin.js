import express from 'express'
import passport from '../config/passport-config.js'
import AuthController from '../controllers/admin/auth-controller.js'
import AdminController from '../controllers/admin/admin-controller.js'
import TimesheetController from '../controllers/admin/timesheet-controller.js'
import {authenticateAdmin} from '../middlewares/authenticate-admin.js'

const adminRouter = express.Router()

const auth = new AuthController()
const admin = new AdminController()
const timesheet = new TimesheetController()

/*
 * Auth Routes
 */

adminRouter.route('/google-login').get(passport.authenticate('google', { scope: ['email'] }))
adminRouter.route('/google-callback').get(passport.authenticate('google', { session: false }), auth.googleCallback)
adminRouter.route('/google-fallback').get(auth.googleFallback)

adminRouter
    .route('/profile-view')
    .post(
        // authenticateAdmin,
        admin.getMyProfile
    )

adminRouter
    .route('/timesheet/add-timesheet')
    .post(
        // authenticateAdmin,
        // checkPermissions('timesheet', 'add'),
        timesheet.addTimesheet
    )

export default adminRouter
