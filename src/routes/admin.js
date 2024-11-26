import express from 'express'
import passport from '../config/passport-config.js'
// import multer from 'multer'

// import {
//     checkAnyPermissions,
//     checkPermissions,
// } from '../middlewares/checkPermission.js'
// import { authenticateAdmin } from '../middlewares/authenticateEmployee.js'
// import uploadCsv from '../utils/uploadCsv.js'
import AuthController from '../controllers/admin/auth-controller.js'
import User from '../models/user.js'
import UserRepository from '../repositories/user-repository.js'


// const upload = multer()
// const multerMiddleware = multer().single('file')

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| In this section, you can define the admin routes and corresponding controller methods.
|
*/

const adminRouter = express.Router()
const userRepo = new UserRepository()

const auth = new AuthController()

/*
 * Auth Routes
 */

adminRouter.route('/google-login').get(passport.authenticate('google', { scope: ['email'] }))
adminRouter.route('/google-callback').get(passport.authenticate('google', { session: false }), auth.googleCallback)
adminRouter.route('/google-fallback').get(auth.googleFallback)


/**
 * Permission Routes
 */
// adminRouter
//     .route('/permission/list')
//     .post(
//         authenticateEmployee,
//         checkPermissions('role-read'),
//         role.listPermission,
//     )
// adminRouter
//     .route('/timesheet/add-timesheet')
//     .post(
//         authenticateEmployee,
//         checkPermissions('role-read'),
//         role.listPermission,
//     )

export default adminRouter
