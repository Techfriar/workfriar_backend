import express from 'express'
import TimesheetController from '../controllers/admin/timesheet-controller.js'

const timesheetRouter = express.Router()

const timesheet = new TimesheetController()

timesheetRouter
    .route('/add-timesheet')
    .post( timesheet.addTimesheet )

timesheetRouter
    .route('/save-timesheets')
    .post( timesheet.updateTimesheet )

timesheetRouter
    .route('/submit-timesheets')
    .post( timesheet.submitTimesheet )

export default timesheetRouter