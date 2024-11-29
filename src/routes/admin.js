import express from 'express'

import CategoryController from '../controllers/category-controller.js'
import ForecastController from '../controllers/forecast-controller.js';
import ProjectTeamController from '../controllers/project-team-controller.js';
const categoryController = new CategoryController();


const adminRouter = express.Router()
const forecastController=new ForecastController()
const projectTeamController=new ProjectTeamController()



// import multer from 'multer'

// // import {
// //     checkAnyPermissions,
// //     checkPermissions,
// // } from '../middlewares/checkPermission.js'
// // import { authenticateEmployee } from '../middlewares/authenticateEmployee.js'
// import uploadCsv from '../utils/uploadCsv.js'




// const upload = multer()
// const multerMiddleware = multer().single('file')
import ClientController from '../controllers/admin/client-controller.js'



//Route for adding category
adminRouter.route("/addcategory").post(categoryController.addCategory)
// Route to get all categories
adminRouter.route("/getcategories").post(categoryController.getCategories)
// Route for updating Category
adminRouter.route("/updatecategories/:id").put(categoryController.updateCategories)

//Route for adding new Forecast
adminRouter.route("/addforecast").post(forecastController.addForecastController)
//Route for getting all forecast
adminRouter.route("/getallforecast").post(forecastController.getForecastController)
//Route for getting a single project forecast
adminRouter.route("/getforecast").post(forecastController.getForecastbyIdController)
//Route for deleting a project forecast
adminRouter.route("/deleteforecast/:id").delete(forecastController.deleteForecastController)
//Route for updaying an existing project forecast 
adminRouter.route("/updateforecast/:id").put(forecastController.updateForecast)

//Route for creating new project team
adminRouter.route("/addprojectteam").post(projectTeamController.addProjectTeam)
//Route for getting the project team
adminRouter.route("/getallprojectteam").post(projectTeamController.getProjectTeam)
//Route for getting a team associated with a project
adminRouter.route("/getprojectteam").post(projectTeamController.getProjectTeambyidController)
//Route for editing the project team
adminRouter.route("/editprojectteam/:id").put(projectTeamController.editProjectTeamController)


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
    .route('/add-timesheet')
    .post(
        // authenticateAdmin,
        // checkPermissions('timesheet', 'add'),
        timesheet.addTimesheet
    )

adminRouter
    .route('/save-timesheets')
    .post(
        // authenticateAdmin,
        // checkPermissions('timesheet', 'add'),
        timesheet.updateTimesheet
    )

adminRouter
    .route('/employee-list')
    .post(
        // authenticateAdmin,
        // checkPermissions('user', 'view'),
        admin.employeeList
    )
/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').put(client.editClient)


export default adminRouter
