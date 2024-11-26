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

/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').put(client.editClient)


export default adminRouter
