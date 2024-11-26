import express from 'express'
// import multer from 'multer'

// import {
//     checkAnyPermissions,
//     checkPermissions,
// } from '../middlewares/checkPermission.js'
// import { authenticateAdmin } from '../middlewares/authenticateEmployee.js'
// import uploadCsv from '../utils/uploadCsv.js'


// const upload = multer()
// const multerMiddleware = multer().single('file')
import ClientController from '../controllers/admin/client-controller.js'

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| In this section, you can define the admin routes and corresponding controller methods.
|
*/

const adminRouter = express.Router()
const client = new ClientController()
// const auth = new AuthController()

import passport from '../config/passport-config.js'
import AuthController from '../controllers/admin/auth-controller.js'
import TimesheetController from '../controllers/admin/timesheet-controller.js'
import {authenticateAdmin} from '../middlewares/authenticate-admin.js'



const auth = new AuthController()
const timesheet = new TimesheetController()

/*
 * Auth Routes
 */

adminRouter.route('/google-login').get(passport.authenticate('google', { scope: ['email'] }))
adminRouter.route('/google-callback').get(passport.authenticate('google', { session: false }), auth.googleCallback)
adminRouter.route('/google-fallback').get(auth.googleFallback)

adminRouter
    .route('/timesheet/add-timesheet')
    .post(
        authenticateAdmin,
        // checkPermissions('timesheet', 'add'),
        timesheet.addTimesheet
    )

/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').put(client.editClient)


export default adminRouter
