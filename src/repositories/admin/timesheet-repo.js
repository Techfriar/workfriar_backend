const Project = require('../models/Project');
const User = require('../models/User');
const TaskCategory = require('../models/TaskCategory');
const Timesheet = require('../models/Timesheet');

export default class TimesheetRepository {

  // Validate Project, User, and TaskCategory references
  async validateReferences(project_id, user_id, task_category_id) {
    const project = await Project.findById(project_id);
    if (!project) throw new Error('Project not found');

    const user = await User.findById(user_id);
    if (!user) throw new Error('User not found');
    if (!project.team.includes(user_id)) throw new Error('User is not part of the project team');

    const taskCategory = await TaskCategory.findById(task_category_id);
    if (!taskCategory) throw new Error('Task Category not found');

    return { project, user, taskCategory };
  }

  // Method to create and save the timesheet
  async createTimesheet(project_id, user_id, task_category_id, task_detail, data_sheet, status='not submitted') {
    try {
      // Validate the references (Project, User, Task Category)
      await this.validateReferences(project_id, user_id, task_category_id);

      // Create the new timesheet
      const newTimesheet = new Timesheet({
        project_id,
        user_id,
        task_category_id,
        task_detail,
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

