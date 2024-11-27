import Timesheet from '../../models/timesheet.js'

export default class TimesheetRepository {

  // Method to create and save the timesheet
  async createTimesheet(project_id, user_id, task_category_id, task_detail, startDate, endDate, data_sheet=[], status='not submitted') {
    try {
  
      // Create the new timesheet
      const newTimesheet = new Timesheet({
        project_id,
        user_id,
        task_category_id,
        task_detail,
        startDate,
        endDate,
        data_sheet,
        status,
      });

      // Save to the database
      await newTimesheet.save();
      return newTimesheet;
    } catch (err) {
      throw new Error('Error while creating timesheet: ' + err.message);
    }
  }
}

