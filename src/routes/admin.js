import express from "express";

import CategoryController from '../controllers/category-controller.js'
import ForecastController from '../controllers/forecast-controller.js';
import ProjectTeamController from '../controllers/project-team-controller.js';
import ClientController from '../controllers/admin/client-controller.js'
import AdminController from '../controllers/admin/admin-controller.js'
import {authenticateAdmin} from '../middlewares/authenticate-admin.js'
import { checkPermissions } from '../middlewares/check-permission.js';
import TimeSheetSummaryController from '../controllers/timeSheet-summarycontroller.js'

const adminRouter = express.Router();

const categoryController = new CategoryController();
const forecastController=new ForecastController()
const projectTeamController=new ProjectTeamController()
const timeSheetSummary=new TimeSheetSummaryController()

const admin = new AdminController();
const client = new ClientController();

// import multer from 'multer'
// // import {
// //     checkAnyPermissions,
// //     checkPermissions,
// // } from '../middlewares/checkPermission.js'
// // import { authenticateEmployee } from '../middlewares/authenticateEmployee.js'
// import uploadCsv from '../utils/uploadCsv.js'
// const upload = multer()
// const multerMiddleware = multer().single('file')

//Route for adding category
adminRouter.route("/addcategory").post(categoryController.addCategory);
// Route for updating Category
adminRouter.route("/updatecategories").post(categoryController.updateCategories)

//Route for adding new Forecast
adminRouter
  .route("/addforecast")
  .post(forecastController.addForecastController);
//Route for getting all forecast
adminRouter
  .route("/getallforecast")
  .post(forecastController.getForecastController);
//Route for getting a single project forecast
adminRouter
  .route("/getforecast")
  .post(forecastController.getForecastbyIdController);
//Route for deleting a project forecast
adminRouter.route("/deleteforecast").post(forecastController.deleteForecastController)
//Route for updaying an existing project forecast 
adminRouter.route("/updateforecast").post(forecastController.updateForecast)

//Route for creating new project team
adminRouter.route("/addprojectteam").post(projectTeamController.addProjectTeam);
//Route for getting the project team
adminRouter
  .route("/getallprojectteam")
  .post(projectTeamController.getProjectTeam);
//Route for getting a team associated with a project
adminRouter
  .route("/getprojectteam")
  .post(projectTeamController.getProjectTeambyidController);
//Route for editing the project team
adminRouter.route("/editprojectteam").post(projectTeamController.editProjectTeamController)

//Route for displaying time summary
adminRouter.route("/timesummary").post(timeSheetSummary.TimeSummaryController)

adminRouter.route("/pastdue").post(timeSheetSummary.pastDueController)

adminRouter.route("/getduetimesheet").post(timeSheetSummary.getDueTimeSheetController)

adminRouter
.route('/profile-view')
    .post(
        // authenticateAdmin,
        admin.getMyProfile
    )

adminRouter
    .route('/employee-list')
    .post(
        // authenticateAdmin,
        checkPermissions('Users', 'view'),
        admin.employeeList
    )
/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').put(client.editClient)


export default adminRouter;
