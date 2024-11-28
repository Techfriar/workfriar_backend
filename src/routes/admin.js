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
adminRouter.post("/addcategory",categoryController.addCategory.bind(categoryController));
// Route to get all categories
adminRouter.get("/getcategories",categoryController.getCategories.bind(categoryController));

// Route for updating Category
adminRouter.put("/updatecategories/:id",categoryController.updateCategories.bind(categoryController));

//Route for adding new Forecast
adminRouter.post("/addforecast",forecastController.addForecastController.bind(forecastController))

//Route for getting all forecast
adminRouter.get("/getforecast",forecastController.getForecastController.bind(forecastController))

//Route for getting a single project forecast
adminRouter.get("/getforecast/:id",forecastController.getForecastbyIdController.bind(forecastController))

//Route for deleting a project forecast
adminRouter.delete("/deleteforecast/:id",forecastController.deleteForecastController.bind(forecastController))

//Route for updaying an existing project forecast 
adminRouter.put("/updateforecast/:id",forecastController.updateForecast.bind(forecastController))

//Route for creating new project team
adminRouter.post("/addprojectteam",projectTeamController.addProjectTeam.bind(projectTeamController))

//Route for getting the project team
adminRouter.get("/getprojectteam",projectTeamController.getProjectTeam.bind(projectTeamController))

//Route for getting a team associated with a project
adminRouter.get("/getprojectteam/:id",projectTeamController.getProjectTeambyidController.bind(projectTeamController))

//Route for editing the project team
adminRouter.put("/editprojectteam/:id",projectTeamController.editProjectTeamController.bind(projectTeamController))


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
