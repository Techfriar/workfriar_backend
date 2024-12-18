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
    .route('/get-due-timesheets')
    .post(timesheet.getDueTimesheets)

timesheetRouter
    .route('/get-timesheet-report')
    .post(timesheet.getTimesheetReport)

timesheetRouter
    .route('/get-timesheet-snapshot')
    .post(timesheet.getTimesheetSnapshot)

timesheetRouter
    .route('/delete-timesheet')
    .post(timesheet.deleteTimesheet)

timesheetRouter
    .route('/get-timesheet-status')
    .post(timesheet.getStatusCount)

timesheetRouter
    .route('/get-weekly-timesheets')
    .post(timesheet.getWeeklyTimesheets)

timesheetRouter
    .route('/get-user-timesheets')
    .post(timesheet.getUserTimesheets)

timesheetRouter
    .route('/submit-due-timesheets')
    .post(timesheet.submitDueTimesheets)

export default timesheetRouter