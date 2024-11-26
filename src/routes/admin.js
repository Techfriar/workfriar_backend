import express from 'express'
import multer from 'multer'

// import {
//     checkAnyPermissions,
//     checkPermissions,
// } from '../middlewares/checkPermission.js'
// import { authenticateEmployee } from '../middlewares/authenticateEmployee.js'
import uploadCsv from '../utils/uploadCsv.js'


const upload = multer()
const multerMiddleware = multer().single('file')

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| In this section, you can define the admin routes and corresponding controller methods.
|
*/

const adminRouter = express.Router()

// const auth = new AuthController()


/*
 * Auth Routes
 */
// adminRouter.route('/login').post(auth.login)

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

export default adminRouter
