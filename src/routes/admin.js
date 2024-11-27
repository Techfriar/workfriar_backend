import express from 'express'

import CategoryController from '../controllers/category-controller.js'
import ForecastController from '../controllers/forecast-controller.js';
const categoryController = new CategoryController();


const adminRouter = express.Router()


//Route for adding category
adminRouter.post("/admin/addcategory",categoryController.addCategory.bind(categoryController));

// Route to get all categories
adminRouter.get("/admin/getcategories",categoryController.getCategories.bind(categoryController));



// Route for updating Category
adminRouter.put("/admin/updatecategories/:id", categoryController.updateCategories.bind(categoryController));

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


const adminRouter=express.Router()

//Route for adding category
adminRouter.post("/admin/addcategory",categoryController.addCategory.bind(categoryController));
// Route to get all categories
adminRouter.get("/admin/getcategories",categoryController.getCategories.bind(categoryController));

// Route for updating Category
adminRouter.put("/admin/updatecategories/:id", categoryController.updateCategories.bind(categoryController));

//Route for adding new Forecast
adminRouter.post("/admin/addforecast",forecastController.addForecast.bind(forecastController))
const client = new ClientController()
// const auth = new AuthController()

import passport from '../config/passport-config.js'
import AuthController from '../controllers/admin/auth-controller.js'
import AdminController from '../controllers/admin/admin-controller.js'
import TimesheetController from '../controllers/admin/timesheet-controller.js'
import {authenticateAdmin} from '../middlewares/authenticate-admin.js'



const auth = new AuthController()
const admin = new AdminController()
const timesheet = new TimesheetController()
const client = new ClientController()


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

/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').put(client.editClient)


export default adminRouter
