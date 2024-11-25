import express from 'express'
/* import multer from 'multer'

import {
    checkAnyPermissions,
    checkPermissions,
} from '../middlewares/checkPermission.js'
import { authenticateAdmin } from '../middlewares/authenticateEmployee.js'
import uploadCsv from '../utils/uploadCsv.js' */
import CategoryController from '../controllers/category-controller.js'
const categoryController = new CategoryController();

const adminRouter=express.Router()
/* const upload = multer()
const multerMiddleware = multer().single('file') */

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
|
| In this section, you can define the admin routes and corresponding controller methods.
|
*/

// const adminRouter = express.Router()

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
adminRouter.post("/admin/addcategory",categoryController.addCategory.bind(categoryController));

// Route to get all categories
adminRouter.get("/admin/getcategories",categoryController.getCategories.bind(categoryController));

//Route for updating time entry

// Route for updating time entry
adminRouter.put("/admin/updatecategories/:id", categoryController.updateCategories.bind(categoryController));


export default adminRouter
