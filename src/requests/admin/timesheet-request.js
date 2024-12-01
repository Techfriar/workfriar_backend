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

	// Validate and process the date range (startDate and endDate)
	static async validateDateRange(startDate, endDate) {
        // Joi Validation for Date Format
        const schema = Joi.object({
            startDate: Joi.date().iso().required().messages({
                'date.base': `"startDate" must be a valid ISO date`,
            }),
            endDate: Joi.date().iso().required().greater(Joi.ref('startDate')).messages({
                'date.base': `"endDate" must be a valid ISO date`,
                'date.greater': `"endDate" must be greater than "startDate"`,
            })
        });

        // Perform Joi validation
        const { error, value } = schema.validate({ startDate, endDate });

        if (error) {
            throw new CustomValidationError(error.details[0].message); // Customize error message if validation fails
        }

        // Return validated values
        return value;
    }

    static async validateProjectSummaryParams({ projectId, Year, Month }) {
        // Joi schema to validate the request body
        const schema = Joi.object({
          projectId: Joi.string().custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message('Invalid projectId');
            }
            return value;
          }).optional().messages({
            'string.base': '"projectId" must be a string if provided',
          }),
          Year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().messages({
            'number.base': '"Year" must be a number if provided',
            'number.min': '"Year" must be a valid year (after 1900) if provided',
            'number.max': '"Year" must not be in the future if provided',
          }),
          Month: Joi.number().integer().min(1).max(12).optional().messages({
            'number.base': '"Month" must be a number if provided',
            'number.min': '"Month" must be between 1 and 12 if provided',
            'number.max': '"Month" must be between 1 and 12 if provided',
          })
        });
    
        // Validate the input data
        const { error, value } = schema.validate({ projectId, Year, Month });
        if (error) {
          throw new CustomValidationError(error.details[0].message);
        }
    
        // Check if projectId exists in the database only if it's provided
        if (value.projectId) {
          const project = await CreateTimesheetRequest.ProjectRepo.getProjectById(value.projectId);
          if (!project) {
            throw new CustomValidationError('Project not found');
          }
        }
    
        return value;  
      }

      static async validateProjectDetailReportParams({ projectId, year, month, startDate, endDate }) {
        const schema = Joi.object({
          projectId: Joi.string().custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message('Invalid "projectId".');
            }
            return value;
          }).optional().messages({
            'string.base': '"projectId" must be a string if provided.',
          }),
          year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().messages({
            'number.base': '"year" must be a number if provided.',
            'number.min': '"year" must be a valid year (after 1900) if provided.',
            'number.max': '"year" must not be in the future if provided.',
          }),
          month: Joi.number().integer().min(1).max(12).optional().messages({
            'number.base': '"month" must be a number if provided.',
            'number.min': '"month" must be between 1 and 12 if provided.',
            'number.max': '"month" must be between 1 and 12 if provided.',
          }),
          startDate: Joi.date().iso().optional().messages({
            'date.base': '"startDate" must be a valid date.',
            'date.format': '"startDate" must be in ISO 8601 format.',
          }),
          endDate: Joi.date().iso().optional().greater(Joi.ref('startDate')).messages({
            'date.base': '"endDate" must be a valid date.',
            'date.format': '"endDate" must be in ISO 8601 format.',
            'date.greater': '"endDate" must be greater than "startDate".',
          }),
        });
    
        
        const { error, value } = schema.validate({ projectId, year, month, startDate, endDate });
        if (error) {
          throw new CustomValidationError(error.details[0].message);
        }
    
 
        if (value.projectId) {
          const project = await this.ProjectRepo.getProjectById(value.projectId); 
          if (!project) {
            throw new CustomValidationError('Project not found.');
          }
        }
    
        return value; // Return the validated values
      }
        
      static async validateEmployeeSummaryParams({ projectId, Year, Month, userId }) {
        const schema = Joi.object({
          projectId: Joi.string().custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message('Invalid "projectId".');
            }
            return value;
          }).optional().messages({
            'string.base': '"projectId" must be a string if provided.',
          }),
          Year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().messages({
            'number.base': '"Year" must be a number if provided.',
            'number.min': '"Year" must be a valid year (after 1900) if provided.',
            'number.max': '"Year" must not be in the future if provided.',
          }),
          Month: Joi.number().integer().min(1).max(12).optional().messages({
            'number.base': '"Month" must be a number if provided.',
            'number.min': '"Month" must be between 1 and 12 if provided.',
            'number.max': '"Month" must be between 1 and 12 if provided.',
          }),
          userId: Joi.string().custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message('Invalid "userId".');
            }
            return value;
          }).optional().messages({
            'string.base': '"userId" must be a string if provided.',
          }),
        });
    

        const { error, value } = schema.validate({ projectId, Year, Month, userId });
        if (error) {
          throw new CustomValidationError(error.details[0].message);
        }
    
        if (value.projectId) {
          const projectExists = await  this.ProjectRepo.getProjectById(value.projectId); // Database call
          if (!projectExists) {
            throw new CustomValidationError('Project not found.');
          }
        }
    
        return value; 
      }

      static async validateEmployeeDetailParams({ year, month, projectId, startDate, endDate, userId }) {
        const schema = Joi.object({
          year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().messages({
            'number.base': '"year" must be a number if provided.',
            'number.min': '"year" must be a valid year (after 1900).',
            'number.max': '"year" must not be in the future.',
          }),
          month: Joi.number().integer().min(1).max(12).optional().messages({
            'number.base': '"month" must be a number if provided.',
            'number.min': '"month" must be between 1 and 12.',
            'number.max': '"month" must be between 1 and 12.',
          }),
          projectId: Joi.string().custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message('Invalid "projectId".');
            }
            return value;
          }).optional().messages({
            'string.base': '"projectId" must be a string if provided.',
          }),
          startDate: Joi.date().iso().optional().messages({
            'date.base': '"startDate" must be a valid ISO 8601 date string if provided.',
          }),
          endDate: Joi.date().iso().optional().messages({
            'date.base': '"endDate" must be a valid ISO 8601 date string if provided.',
          }),
          userId: Joi.string().custom((value, helpers) => {
            if (value && !mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message('Invalid "userId".');
            }
            return value;
          }).optional().messages({
            'string.base': '"userId" must be a string if provided.',
          }),
        });

        const { error, value } = schema.validate({ year, month, projectId, startDate, endDate, userId });
        if (error) {
          throw new CustomValidationError(error.details[0].message);
        }

        if (value.projectId) {
          const projectExists = await ProjectRepo.getProjectById(value.projectId);
          if (!projectExists) {
            throw new CustomValidationError('Project not found.');
          }
        }
    
        return value;
      }
    
      static async validateYearMonth({year, month}) {
        const schema = Joi.object({
            year: Joi.number()
                .integer()
                .min(1900)
                .max(new Date().getFullYear())
                .optional()
                .messages({
                    'number.base': `"year" must be a valid number if provided`,
                    'number.integer': `"year" must be an integer if provided`,
                    'number.min': `"year" must be at least 1900 if provided`,
                    'number.max': `"year" cannot be greater than the current year`,
                }),
            month: Joi.number()
                .integer()
                .min(1)
                .max(12)
                .optional()
                .messages({
                    'number.base': `"month" must be a valid number if provided`,
                    'number.integer': `"month" must be an integer if provided`,
                    'number.min': `"month" must be at least 1 if provided`,
                    'number.max': `"month" cannot be greater than 12`,
                }),
        });
    
        const { error, value } = schema.validate({ year, month });
    
        if (error) {
            throw new CustomValidationError(error.details[0].message); // Handle validation error
        }
    
        return value; // Return validated and sanitized values
    }
    
    

}