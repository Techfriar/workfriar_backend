import express from "express";

import CategoryController from '../controllers/category-controller.js'
import ForecastController from '../controllers/forecast-controller.js';
import ProjectTeamController from '../controllers/project-team-controller.js';
import ClientController from '../controllers/admin/client-controller.js'
import AdminController from '../controllers/admin/admin-controller.js'
import { checkPermissions } from '../middlewares/check-permission.js';
import RoleController from "../controllers/admin/role-controller.js";
import TimeSheetSummaryController from '../controllers/timeSheet-summarycontroller.js'
import TimesheetApprovalController from "../controllers/admin/timesheet-approval-controller.js";
import EmployeeController from "../controllers/admin/employee-controller.js";
import multer from "multer";
import PopulateData from "../utils/currency-country-populate.js";

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
const timesheetapproval=new TimesheetApprovalController()

const populateData = new PopulateData()

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

//Route for setting an end date for a project team member
adminRouter.route("/setenddate").post(projectTeamController.setEndDateController);
//Route for getting the project team
adminRouter
  .route("/getallprojectteam")
  .post(projectTeamController.getProjectTeam);

//get projects of  an employee
adminRouter
  .route("/getprojectsbyemployee")
  .post(projectTeamController.getEmployeeProjects);

//Route for getting a team associated with a project
adminRouter
  .route("/getprojectteam")
  .post(projectTeamController.getProjectTeambyidController);
//Route for editing the project team
adminRouter.route("/editprojectteam").post(projectTeamController.editProjectTeamController)

//Route for making a user active in a project
adminRouter.route("/activateuser").post(projectTeamController.activateUserController);

//Route for displaying time summary
adminRouter.route("/timesummary").post(timeSheetSummary.TimeSummaryController)

adminRouter.route("/pastdue").post(timeSheetSummary.pastDueController)

adminRouter.route("/getduetimesheet").post(timeSheetSummary.getDueTimeSheetController)


/**
 * Admin profile view
 */
adminRouter
.route('/profile-view')
    .post( admin.getMyProfile )
/*
* List Employees
*/

adminRouter
    .route('/employees-data')
    .post(
        // checkPermissions('Users', 'view'),
        admin.listAllEmployeesData
    )
adminRouter
    .route('/list-all-employees')
    .post(
        // checkPermissions('Users', 'view'),
        admin.listAllEmployees
    )
adminRouter
    .route('/employee-details')
    .post(
        // checkPermissions('Users', 'view'),
        admin.getEmployeeDetails
    )
adminRouter
    .route('/update-employee-role')
    .post(
        // checkPermissions('Users', 'edit'),
        admin.updateEmployeeRole
    )
adminRouter
    .route('/delete-employee')
    .post(
        // checkPermissions('Users', 'delete'),
        admin.deleteEmployee
    )

adminRouter
  .route('/list-projects-employees')
  .post(admin.getProjectsAndEmployees) 
/* 
* Client Routes
*/
adminRouter.route('/add-client').post(client.addClient)
adminRouter.route('/all-clients').post(client.allClient)
adminRouter.route('/edit-client').post(client.editClient)
adminRouter.route('/change-client-status').post(client.changeClientStatus)

/*
Country-Currency-Dropdown
*/
adminRouter.route('/populate-country').post(populateData.populateCountry)
adminRouter.route('/populate-currency').post(populateData.populateCurrency)

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
adminRouter.route('/get-team-leads').post(role.getTeamLeads)
adminRouter.route('/get-client-managers').post(role.getClientManager)
adminRouter.route('/list-all-employees-by-department').post(role.listAllEmployeesByDepartment)
/*
Employee Routes
*/

adminRouter.route('/addemployee').post(upload.fields([{ name: "profile_pic", maxCount: 1 }]),employee.addEmployees)


adminRouter.route('/getroles').post(employee.getRoles)
adminRouter.route('/editemployee').post(upload.fields([{ name: "profile_pic", maxCount: 1 }]),employee.editEmployee)

//Approval center Routes

adminRouter.route('/approvalcenter').post(timesheetapproval.getMembers)

adminRouter.route('/managetimesheet').post(timesheetapproval.manageTimeSheet)

adminRouter.route('/manage-all-timesheet').post(timesheetapproval.manageAllTimesheet)

adminRouter.route('/team-members-with-timesheet').post(projectTeamController.getTeamMembersWithTimesheetController)

adminRouter.route('/get-all-weekly-timesheets-for-review').post(timesheetapproval.getAllWeeklyTimesheetsForReview)

export default adminRouter;
