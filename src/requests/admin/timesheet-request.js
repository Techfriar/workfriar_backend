import Joi from 'joi';
import mongoose from 'mongoose';
import ProjectRepository from '../../repositories/admin/project-repository.js'
import TaskCateogryRepository from '../../repositories/admin/category-repository.js'
import UserRepository from '../../repositories/user-repository.js';
import HolidayRepository from '../../repositories/holiday-repository.js';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import IsDateInRange from '../../services/isDateInRange.js';
import TimesheetRepository from '../../repositories/admin/timesheet-repository.js';

export default class CreateTimesheetRequest {

	static ProjectRepo = new ProjectRepository()
	static UserRepo = new UserRepository()
	static TimesheetRepo = new TimesheetRepository()
	static HolidayRepo = new HolidayRepository()
	static  TaskCategoryRepo = new TaskCateogryRepository()

    // Validate Project, User, and TaskCategory references
    static async validateReferences(project_id, user_id, task_category_id) {
        const project = await this.ProjectRepo.getProjectById(project_id);
        if (!project) throw new CustomValidationError('Project not found');

        const user = await this.UserRepo.getUserById(user_id)
        if (!user) throw new CustomValidationError('User not found');
        // if (!project.team || project.team && !project.team.team_members || (project.team && !project.team.team_members.includes(user_id))) throw new CustomValidationError('User is not part of the project team');

        const taskCategory = await this.TaskCategoryRepo.getCategoryById(task_category_id);
        if (!taskCategory) throw new CustomValidationError('Task Category not found');

    return { project, user, taskCategory };
  }

    /**
   * Validate the main timesheet inputs.
   * @param {string} timesheetId 
   * @param {Array} data_sheet 
   * @returns {string|null} Error message or null if valid
   */
	static async validateTimesheetAndOwnership(timesheetId, user_id) {
		if (!timesheetId) throw new CustomValidationError('timesheetId is required')
	
		const timesheet = await this.TimesheetRepo.getTimesheetById(timesheetId);
	
		if (!timesheet) throw new CustomValidationError('Timesheet not found')
		
		if (!timesheet.user_id.equals(new mongoose.Types.ObjectId(user_id))) {
			throw new CustomValidationError('Unauthorized to update this timesheet')
		}

		// Check if the timesheet is already submitted or accepted
		if (['submitted', 'accepted'].includes(timesheet.status)) {
			throw new Error('Timesheet cannot be updated as it is already submitted or accepted');
		}
	
		return { error: false, timesheet };
	}
	
	static async validateProjectStatus(projectId) {
		// Fetch the associated project by its ID
		const project = await this.ProjectRepo.getProjectById(projectId);

		if (!project) {
			throw new CustomValidationError('Associated project not found');
		}

		if(!["In Progress"].includes(project.status)){
			throw new CustomValidationError('Time entry is not enabled for the associated project');
		}
	 
		// Verify the project's "Time Entry" field
		if (project.open_for_time_entry == 'closed') {
			if(
				project.effective_close_date &&
				new Date(project.effective_close_date) < Date.now()
			) {
				throw new CustomValidationError('Time entry is not enabled for the associated project');
			} else if(!project.effective_close_date) {
				throw new CustomValidationError('Time entry is not enabled for the associated project');
			}
		}

		return {error: false};
	}

	static async validateAndProcessDataSheet(data_sheet, timesheet) {
		// Validate that data_sheet is an array
		if (!Array.isArray(data_sheet)) throw new CustomValidationError('Data sheet should be an array')
		
		for (const item of data_sheet) {
			if (!item.date || !item.hours) throw new CustomValidationError('Each data_sheet item must include "date" and "hours"')
	
			if (!IsDateInRange.isDateInRange(item.date, timesheet.startDate, timesheet.endDate)) {
				throw new CustomValidationError(`Date ${item.date} is outside the timesheet's start and end date range`)
			}
	
			const isHoliday = await this.HolidayRepo.isHoliday(item.date);
			item.isHoliday = isHoliday; // Add isHoliday field directly to the item
		}
	
		return { error: false }; // If all validations pass
	}
	

}