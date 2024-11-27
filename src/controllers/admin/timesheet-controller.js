import mongoose from 'mongoose';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import TimesheetRepository from '../../repositories/admin/timesheet-repository.js';
import HolidayRepository from '../../repositories/holiday-repository.js';
import IsDateInRange from '../../services/isDateInRange.js';
// import TimesheetRequest from '../../requests/admin/timesheet-request.js'
import FindSunday from '../../services/findSunday.js';
import FindWeekRange from '../../services/findWeekRange.js';

const TimesheetRepo = new TimesheetRepository()
const HolidayRepo = new HolidayRepository()

// const TimesheetReq = new TimesheetRequest()
const FindSunday_ = new FindSunday()
const FindWeekRange_ = new FindWeekRange()
const IsDateInRange_ = new IsDateInRange()

// Admin controller to add a timesheet
export default class TimesheetController {

	/**
 * @swagger
 * /admin/add-timesheet:
 *   post:
 *     summary: Add a new timesheet
 *     description: Adds a new timesheet entry for the current user. Requires a valid JWT in the `Authorization` header.
 *     tags:
 *       - Timesheet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Payload for adding a timesheet
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: string
 *                 description: ID of the project.
 *                 example: "6487b93f2d3e4a0c8c2b32a9"
 *               task_category_id:
 *                 type: string
 *                 description: ID of the task category.
 *                 example: "6487b9402d3e4a0c8c2b32aa"
 *               task_detail:
 *                 type: string
 *                 description: Description of the task.
 *                 example: "Worked on front-end feature X."
 *               data_sheet:
 *                 type: array
 *                 description: List of timesheet data entries (optional).
 *                 items:
 *                   type: object
 *                 example: []
 *               status:
 *                 type: string
 *                 description: Status of the timesheet entry.
 *                 example: "In Progress"
 *     responses:
 *       201:
 *         description: Timesheet successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Timesheet added successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation error"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No token provided"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


	// Controller method to handle adding a timesheet
	async addTimesheet(req, res) {

		try {
			// Extract token from Authorization header
			// const token = req.headers.authorization?.split(' ')[1];  // 'Bearer <token>'

			// if (!token) {
			// 	return res.status(401).json({ 
			// 		status:false,
			// 		message: 'No token provided',
			// 		data: []
			// 	});
			// }

			// // Decode the token without verifying it (get the payload)
			// const decoded = jwt.decode(token);  // Decode without verification

			// const user_id = decoded.UserId; 

            const user_id = '6744a7c9707ecbeea1efd14c'

			const { project_id, task_category_id, task_detail, data_sheet=[], status='not submitted' } = req.body;

			// await TimesheetReq.validateReferences(project_id, user_id, task_category_id)

			const today = new Date(); // Reference date (can be any date)
			// const today = '2024-11-29'
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);
			console.log(new Date(weekEndDate.getTime()).toLocaleString())
			// Call the Repository to create the timesheet
			await TimesheetRepo.createTimesheet(project_id, user_id, task_category_id, task_detail, weekStartDate, weekEndDate, data_sheet, status);
			 
			return res.status(201).json({ 
				status:true,
				message: 'Timesheet added successfully', 
				data: []
			});
		} catch (err) {

			if(err instanceof CustomValidationError){
				return res.status(400).json({ 
					status:false, 
					message: err.errors, 
					data: [] 
				});
			}
			return res.status(500).json({ 
				status:false,
				message: err.message, 
				data: []
			});
		}
	}

/**
 * @swagger
 * /admin/save-timesheet:
 *   post:
 *     summary: Update timesheet entries
 *     description: Update the `data_sheet` of a timesheet. Ensures the timesheet is not in `submitted` or `accepted` status before allowing updates.
 *     tags:
 *       - Timesheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timesheetId:
 *                 type: string
 *                 description: ID of the timesheet to update
 *                 example: "64f6c25e97f847001c24f7c9"
 *               data_sheet:
 *                 type: array
 *                 description: Array of data_sheet entries to add or update
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Date of the timesheet entry (YYYY-MM-DD format)
 *                       example: "2024-11-29"
 *                     hours:
 *                       type: string
 *                       description: Hours worked on the date
 *                       example: "8"
 *             required:
 *               - timesheetId
 *               - data_sheet
 *     responses:
 *       200:
 *         description: Successfully updated the timesheet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Timesheet updated successfully
 *                 data:
 *                   type: object
 *                   description: Updated timesheet object
 *                   example:
 *                     _id: "64f6c25e97f847001c24f7c9"
 *                     project_id: "64f6c25e97f847001c24f7a1"
 *                     user_id: "64f6c25e97f847001c24f7a2"
 *                     task_category_id: "64f6c25e97f847001c24f7a3"
 *                     task_detail: "Complete module A"
 *                     startDate: "2024-11-27T00:00:00.000Z"
 *                     endDate: "2024-12-03T00:00:00.000Z"
 *                     data_sheet:
 *                       - date: "2024-11-29T00:00:00.000Z"
 *                         isHoliday: false
 *                         hours: "8"
 *                       - date: "2024-11-30T00:00:00.000Z"
 *                         isHoliday: true
 *                         hours: "0"
 *                     status: "not submitted"
 *                     createdAt: "2024-11-27T12:00:00.000Z"
 *                     updatedAt: "2024-11-29T15:00:00.000Z"
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid timesheetId or data_sheet format
 *                 data:
 *                   type: array
 *                   example: []
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 data:
 *                   type: array
 *                   example: []
 */

	async updateTimesheet(req, res) {
		try {
			// // Extract token from Authorization header
			// const token = req.headers.authorization?.split(' ')[1];  // 'Bearer <token>'

			// if (!token) {
			// 	return res.status(401).json({ 
			// 		status:false,
			// 		message: 'No token provided',
			// 		data: []
			// 	});
			// }

			// // Decode the token without verifying it (get the payload)
			// const decoded = jwt.decode(token);  // Decode without verification

			// const user_id = decoded.UserId; 

			const user_id = '6744a7c9707ecbeea1efd14c'; // Replace this with decoded user ID from the token in production
			const { timesheetId, data_sheet } = req.body;

			if (!timesheetId || !Array.isArray(data_sheet)) {
				return res.status(400).json({
					status: false,
					message: 'Invalid timesheetId or data_sheet format',
					data: [],
				});
			}

			// Check if the timesheet belongs to the user
			const timesheet = await TimesheetRepo.getTimesheetById(timesheetId);
			console.log(timesheet)
			if (!timesheet || !timesheet.user_id.equals(new mongoose.Types.ObjectId(user_id))) {
				return res.status(403).json({
					status: false,
					message: 'Unauthorized to update this timesheet',
					data: [],
				});
			}

			// Validate data_sheet items
			for (const item of data_sheet) {
				if (!item.date || !item.hours) {
					return res.status(400).json({
						status: false,
						message: 'Each data_sheet item must include "date" and "hours"',
						data: [],
					});
				}

				// Check if the item.date is within the timesheet start and end date range
				if (!IsDateInRange_.isDateInRange(item.date, timesheet.startDate, timesheet.endDate)) {
					return res.status(400).json({
						status: false,
						message: `Date ${item.date} is outside the timesheet's start and end date range`,
						data: [],
					});
				}

				// Check if the date is a holiday
				const isHoliday = await HolidayRepo.isHoliday(item.date);
				item.isHoliday = isHoliday;
				console.log(item)
			}

			// Update the timesheet data_sheet and set status to 'saved'
			const updatedTimesheet = await TimesheetRepo.updateTimesheetData(timesheetId, {
				data_sheet,
				status: 'saved',
			});

			return res.status(200).json({
				status: true,
				message: 'Timesheet saved successfully',
				data: updatedTimesheet,
			});
		} catch (err) {
			return res.status(500).json({
				status: false,
				message: err.message,
				data: [],
			});
		}
	}

}
