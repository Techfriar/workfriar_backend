import Joi from 'joi';
import mongoose from 'mongoose';
import ProjectRepository from '../../repositories/admin/project-repository.js'
import TaskCateogryRepository from '../../repositories/admin/category-repository.js'
import UserRepository from '../../repositories/user-repository.js'; 
import HolidayRepository from '../../repositories/holiday-repository.js';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import IsDateInRange from '../../services/isDateInRange.js';
import TimesheetRepository from '../../repositories/admin/timesheet-repository.js';

const TimesheetRepo = new TimesheetRepository()
const HolidayRepo = new HolidayRepository()
const IsDateInRange_ = new IsDateInRange()

export default class CreateTimesheetRequest {

	static ProjectRepo = new ProjectRepository()
	static UserRepo = new UserRepository()
	static  TaskCategoryRepo = new TaskCateogryRepository()

    // Validate Project, User, and TaskCategory references
    async validateReferences(project_id, user_id, task_category_id) {
        const project = await ProjectRepo.findById(project_id);
        if (!project) throw new CustomValidationError('Project not found');

        const user = await UserRepo.getUserById(user_id)
        if (!user) throw new Error('User not found');
        if (!project.team.includes(user_id)) throw new CustomValidationError('User is not part of the project team');

        const taskCategory = await TaskCategory.findById(task_category_id);
        if (!taskCategory) throw new CustomValidationError('Task Category not found');

        return { project, user, taskCategory };
    }

    /**
   * Validate the main timesheet inputs.
   * @param {string} timesheetId 
   * @param {Array} data_sheet 
   * @returns {string|null} Error message or null if valid
   */
	async validateTimesheetAndOwnership(timesheetId, user_id) {
		if (!timesheetId) throw new CustomValidationError('timesheetId is required')
	
		const timesheet = await TimesheetRepo.getTimesheetById(timesheetId);
	
		if (!timesheet) throw new CustomValidationError('Timesheet not found')
		
		if (!timesheet.user_id.equals(new mongoose.Types.ObjectId(user_id))) {
			throw new CustomValidationError('Unauthorized to update this timesheet')
		}
	
		return { error: false, timesheet };
	}
	
	async validateAndProcessDataSheet(data_sheet, timesheet) {
		if (!Array.isArray(data_sheet)) throw new CustomValidationError('data_sheet must be an array')
		
		for (const item of data_sheet) {
			if (!item.date || !item.hours) throw new CustomValidationError('Each data_sheet item must include "date" and "hours"')
	
			if (!IsDateInRange_.isDateInRange(item.date, timesheet.startDate, timesheet.endDate)) {
				throw new CustomValidationError(`Date ${item.date} is outside the timesheet's start and end date range`)
			}
	
			const isHoliday = await HolidayRepo.isHoliday(item.date);
			item.isHoliday = isHoliday; // Add isHoliday field directly to the item
		}
	
		return { error: false }; // If all validations pass
	}
	

}