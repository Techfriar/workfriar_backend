import express from "express";

import CategoryController from '../controllers/category-controller.js'
import ForecastController from '../controllers/forecast-controller.js';
import ProjectTeamController from '../controllers/project-team-controller.js';
import ClientController from '../controllers/admin/client-controller.js'
import AdminController from '../controllers/admin/admin-controller.js'
import {authenticateAdmin} from '../middlewares/authenticate-admin.js'
import { checkPermissions } from '../middlewares/check-permission.js';
import RoleController from "../controllers/admin/role-controller.js";
import TimeSheetSummaryController from '../controllers/timeSheet-summarycontroller.js'
import EmployeeController from "../controllers/admin/employee-controller.js";
import multer from "multer";

const adminRouter = express.Router();
const upload=multer()

const categoryController = new CategoryController();
const forecastController=new ForecastController()
const projectTeamController=new ProjectTeamController()
const timeSheetSummary=new TimeSheetSummaryController()
const employee = new EmployeeController();

const admin = new AdminController();
const client = new ClientController();
const role = new RoleController();

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

/**
 * Admin profile view
 */
adminRouter
.route('/profile-view')
    .post(
        // authenticateAdmin,
        admin.getMyProfile
    )
/*
* List Employees
*/

adminRouter
    .route('/employees-data')
    .post(
        // authenticateAdmin,
        checkPermissions('Users', 'view'),
        admin.listAllEmployeesData
    )
adminRouter
    .route('/list-all-employees')
    .post(
        // authenticateAdmin,
        // checkPermissions('Users', 'view'),
        admin.listAllEmployees
    )
adminRouter
    .route('/employee-details')
    .post(
        // authenticateAdmin,
        // checkPermissions('Users', 'view'),
        admin.getEmployeeDetails
    )
adminRouter
    .route('/update-employee-role')
    .post(
        // authenticateAdmin,
        // checkPermissions('Users', 'edit'),
        admin.updateEmployeeRole
    )
adminRouter
    .route('/delete-employee')
    .post(
        // authenticateAdmin,.
        // checkPermissions('Users', 'delete'),
        admin.deleteEmployee
    )
/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').post(client.editClient)

/*
* Role Routes
*/
adminRouter.route('/add-role').post(role.createRole)
adminRouter.route('/map-role').post(role.mapRole)
adminRouter.route('/all-roles').post(role.viewAllRoles)
adminRouter.route('/delete-role').post(role.deleteRole)
adminRouter.route('/update-role').post(role.updateRole)
adminRouter.route('/all-roll-permissions').post(role.viewAllPermissionsByRole)
adminRouter.route('/remove-user-role').post(role.removeUserFromRole)

/*
Employee Routes
*/

adminRouter.route('/addemployee').post(upload.fields([{ name: "profile_pic", maxCount: 1 }]),employee.addEmployees)


adminRouter.route('/getroles').post(employee.getRoles)
adminRouter.route('/editemployee').post(upload.fields([{ name: "profile_pic", maxCount: 1 }]),employee.editEmployee)


export default adminRouter;
