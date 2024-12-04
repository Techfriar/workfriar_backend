import express from 'express'
import TimesheetController from '../controllers/admin/timesheet-controller.js'

const timesheetRouter = express.Router()

const timesheet = new TimesheetController()

timesheetRouter
    .route('/save-timesheets')
    .post( timesheet.updateTimesheet )

timesheetRouter
    .route('/submit-timesheets')
    .post( timesheet.submitTimesheet )

timesheetRouter
    .route('/get-current-day-timesheets')
    .post(timesheet.getCurrentDayTimesheet)

timesheetRouter
    .route('/filter-weekly-timesheets')
    .post(timesheet.filterWeeklyTimesheet)

timesheetRouter
    .route('/get-current-week-timesheets')
    .post(timesheet.getCurrentWeekTimeheet)

timesheetRouter
    .route('/get-due-timesheets')
    .post(timesheet.getDueTimesheets)

timesheetRouter
    .route('/get-project-summary-report')
    .post(timesheet.getProjectSummaryReport)

timesheetRouter
    .route('/get-project-detail-report')
    .post(timesheet.projectDetailReport)

timesheetRouter
    .route('/get-employee-summary-report')
    .post(timesheet.getEmployeeSummaryReport)

timesheetRouter
    .route('/get-employee-detail-report')
    .post(timesheet.getEmployeeDetailReport)

timesheetRouter
    .route('/get-timesheet-snapshot')
    .post(timesheet.getTimesheetSnapshot)

export default timesheetRouter