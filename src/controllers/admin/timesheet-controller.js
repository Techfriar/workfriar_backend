import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import TimesheetRepository from '../../repositories/admin/timesheet-repository.js';
import TimesheetRequest from '../../requests/admin/timesheet-request.js'
import FindWeekRange from '../../services/findWeekRange.js';
import ProjectRepository from '../../repositories/admin/project-repository.js';
import TimesheetResponse from '../../responses/timesheet-response.js';
import moment from 'moment';
import HolidayRepository from '../../repositories/holiday-repository.js';
import IsDateInRange from '../../services/isDateInRange.js';

const TimesheetRepo = new TimesheetRepository()
const HolidayRepo = new HolidayRepository()
const ProjectRepo = new ProjectRepository()

const TimesheetReq = new TimesheetRequest()
const FindWeekRange_ = new FindWeekRange()
const IsDateInRange_ = new IsDateInRange()

const timesheetResponse = new TimesheetResponse()

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

			const { project_id, task_category_id, task_detail, data_sheet = [], status = 'not submitted' } = req.body;

			// await TimesheetReq.validateReferences(project_id, user_id, task_category_id)

			const today = new Date(); // Reference date (can be any date)
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);
			// Call the Repository to create the timesheet
			await TimesheetRepo.createTimesheet(project_id, user_id, task_category_id, task_detail, weekStartDate, weekEndDate, data_sheet, status);

			return res.status(201).json({
				status: true,
				message: 'Timesheet added successfully',
				data: []
			});
		} catch (err) {

			if (err instanceof CustomValidationError) {
				return res.status(400).json({
					status: false,
					message: err.errors,
					data: []
				});
			}
			return res.status(500).json({
				status: false,
				message: err.message,
				data: []
			});
		}
	}

	/**
	 * @swagger
	 * /admin/save-timesheets:
	 *   post:
	 *     summary: Update multiple timesheet entries
	 *     description: Update the `data_sheet` of multiple timesheets. Ensures each timesheet is not in `submitted` or `accepted` status before allowing updates.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               timesheets:
	 *                 type: array
	 *                 description: Array of timesheets to update
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     timesheetId:
	 *                       type: string
	 *                       description: ID of the timesheet to update
	 *                       example: "64f6c25e97f847001c24f7c9"
	 *                     data_sheet:
	 *                       type: array
	 *                       description: Array of data_sheet entries to add or update
	 *                       items:
	 *                         type: object
	 *                         properties:
	 *                           date:
	 *                             type: string
	 *                             format: date
	 *                             description: Date of the timesheet entry (YYYY-MM-DD format)
	 *                             example: "2024-11-29"
	 *                           hours:
	 *                             type: string
	 *                             description: Hours worked on the date
	 *                             example: "8"
	 *     responses:
	 *       200:
	 *         description: Successfully updated the timesheets
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
	 *                   example: "All timesheets updated successfully"
	 *                 data:
	 *                   type: object
	 *                   properties:
	 *                     updatedTimesheets:
	 *                       type: array
	 *                       description: List of successfully updated timesheets
	 *                       items:
	 *                         type: object
	 *                         properties:
	 *                           timesheetId:
	 *                             type: string
	 *                             example: "64f6c25e97f847001c24f7c9"
	 *                           status:
	 *                             type: string
	 *                             example: "saved"
	 *                     errors:
	 *                       type: array
	 *                       description: List of errors for timesheets that failed to update
	 *                       items:
	 *                         type: object
	 *                         properties:
	 *                           timesheetId:
	 *                             type: string
	 *                             example: "64f6c25e97f847001c24f7d0"
	 *                           message:
	 *                             type: string
	 *                             example: "Unauthorized to update this timesheet"
	 *       207:
	 *         description: Partial success - some timesheets failed to update
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
	 *                   example: "Some timesheets failed to save"
	 *                 data:
	 *                   type: object
	 *                   properties:
	 *                     updatedTimesheets:
	 *                       type: array
	 *                       description: List of successfully updated timesheets
	 *                       items:
	 *                         type: object
	 *                         properties:
	 *                           timesheetId:
	 *                             type: string
	 *                             example: "64f6c25e97f847001c24f7c9"
	 *                           status:
	 *                             type: string
	 *                             example: "saved"
	 *                     errors:
	 *                       type: array
	 *                       description: List of errors for timesheets that failed to update
	 *                       items:
	 *                         type: object
	 *                         properties:
	 *                           timesheetId:
	 *                             type: string
	 *                             example: "64f6c25e97f847001c24f7d0"
	 *                           message:
	 *                             type: string
	 *                             example: "Unauthorized to update this timesheet"
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
	 *                   example: "Invalid input: timesheets should be a non-empty array"
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
	 *                   example: "Internal server error"
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

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
				message: 'Timesheets saved successfully',
				data: updatedTimesheets,
			});
		} catch (err) {
			return res.status(500).json({
				status: false,
				message: err.message,
				data: [],
			});
		}
	}

	//get all timesheets of a user
	/**
	 * @swagger
	 * /admin/get-user-timesheets:
	 *   post:
	 *     summary: Get user timesheets
	 *     description: Fetches the timesheets for the user based on the provided JWT token.
	 *     operationId: getUserTimesheets
	 *     tags:
	 *       - Timesheet
	 *     responses:
	 *       '200':
	 *         description: User timesheets fetched successfully
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: true
	 *             message:
	 *               type: string
	 *               example: 'User timesheets fetched successfully'
	 *             data:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   userid:
	 *                     type: string
	 *                     example: '6746a473ed7e5979a3a1f891'
	 *                   projectid:
	 *                     type: string
	 *                     example: '1234abcd5678'
	 *                   category:
	 *                     type: string
	 *                     example: 'Development'
	 *                   detail:
	 *                     type: string
	 *                     example: 'Worked on feature X'
	 *                   data:
	 *                     type: object
	 *                     additionalProperties: true
	 *                     example: {"2024-11-22": 4}
	 *       '400':
	 *         description: No timesheets found
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: false
	 *             message:
	 *               type: string
	 *               example: 'No timesheets found'
	 *             data:
	 *               type: array
	 *               items: {}
	 *       '401':
	 *         description: Unauthorized - No token provided
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: false
	 *             message:
	 *               type: string
	 *               example: 'No token provided'
	 *             data:
	 *               type: array
	 *               items: {}
	 *       '500':
	 *         description: Internal server error
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: false
	 *             message:
	 *               type: string
	 *               example: 'Error message'
	 *             data:
	 *               type: array
	 *               items: {}
	 */

	async getUserTimesheets(req, res) {
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
			const user_id = '6746a473ed7e5979a3a1f891';
			const timesheets = await TimesheetRepo.getUserTimesheets(user_id)

			if (timesheets.length > 0) {
				res.status(200).json({
					success: true,
					message: 'User timesheets fetched successfully',
					data: timesheets
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: 'No timesheets found',
					data: []
				})
			}
		} catch (err) {
			return res.status(500).json({
				status: false,
				message: err.message,
				data: [],
			});
		}


	}

	//get timesheet details with current date
	/**
	 * @swagger
	 * /admin/get-current-day-timesheets:
	 *   post:
	 *     summary: Get current day's timesheet for the user
	 *     description: Fetches the timesheet entries for the current day based on the provided JWT token.
	 *     operationId: getCurrentDayTimesheet
	 *     tags:
	 *       - Timesheet
	 *     responses:
	 *       '200':
	 *         description: Current day's timesheets fetched successfully
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: true
	 *             message:
	 *               type: string
	 *               example: 'Current Date timesheets fetched successfully'
	 *             length:
	 *               type: integer
	 *               example: 3
	 *             data:
	 *               type: array
	 *               items:
	 *                 type: object
	 *                 properties:
	 *                   projectId:
	 *                     type: string
	 *                     example: '6746afa90f425a352c7bcd8e'
	 *                   projectName:
	 *                     type: string
	 *                     example: 'Soeazy'
	 *                   hours:
	 *                     type: number
	 *                     format: float
	 *                     example: 3
	 *       '400':
	 *         description: No timesheets found for the current day
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: false
	 *             message:
	 *               type: string
	 *               example: 'No timesheets found'
	 *             data:
	 *               type: array
	 *               items: {}
	 *       '401':
	 *         description: Unauthorized - No token provided
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: false
	 *             message:
	 *               type: string
	 *               example: 'No token provided'
	 *             data:
	 *               type: array
	 *               items: {}
	 *       '500':
	 *         description: Internal server error
	 *         schema:
	 *           type: object
	 *           properties:
	 *             success:
	 *               type: boolean
	 *               example: false
	 *             message:
	 *               type: string
	 *               example: 'Error message'
	 *             data:
	 *               type: array
	 *               items: {}
	 */
	async getCurrentDayTimesheet(req, res) {
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
			const user_id = '6746a474ed7e5979a3a1f896';
			const startOfDay = new Date();
			startOfDay.setUTCHours(0, 0, 0, 0);

			const endOfDay = new Date(startOfDay);
			endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
			endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1);

			const timesheets = await TimesheetRepo.getCurrentDayTimesheets(user_id, startOfDay, endOfDay)

			const filteredData = timesheets.map(timesheet => {
				const filteredDataSheet = timesheet.data_sheet.filter(data => {
					const dataDate = new Date(data.date).toISOString().split('T')[0];
					const startOfDayDate = new Date(startOfDay).toISOString().split('T')[0];
					return dataDate === startOfDayDate;
				});
				return {
					project_id: timesheet.project_id,
					data_sheet: filteredDataSheet
				}
			})



			const groupedData = filteredData.reduce((acc, item) => {
				// Check if the project_id already exists in the accumulator
				if (!acc[item.project_id]) {
					acc[item.project_id] = {
						project_id: item.project_id,
						data_sheet: [],
						total_hours: 0
					};
				}

				// Add each timesheet's data to the respective project_id group
				item.data_sheet.forEach(data => {
					acc[item.project_id].data_sheet.push(data);
					acc[item.project_id].total_hours += parseFloat(data.hours); // Sum hours
				});

				return acc;
			}, {});

			// Convert the grouped data to an array
			const resultData = Object.values(groupedData);


			if (resultData.length > 0) {
				//const data = await Promise.all(
				//     users.map(
				//         async (user) =>
				//             await UserResponse.format(user),
				//     ),
				// )
				const data = await Promise.all(
					resultData.map(async (item) =>
						await timesheetResponse.currentDateTimesheetResponse(item)
					)
				)
				res.status(200).json({
					success: true,
					message: 'Current Date timesheets fetched successfully',
					length: resultData.length,
					data: data
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: 'No timesheets found',
					data: []
				})
			}

		}
		catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	//get timesheet details filtered by week 
	async filterWeeklyTimesheet(req, res) {
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
			const user_id = '6746a474ed7e5979a3a1f896';
			const { startDate, endDate } = req.body

			const start = new Date(startDate)
			const end = new Date(endDate)

			const timesheets = await TimesheetRepo.getWeeklyTimesheets(user_id, start, end)


			if (timesheets.length > 0) {
				const data = await Promise.all(
					timesheets.map(async (item) =>
						await timesheetResponse.weeklyTimesheetResponse(item)
					)
				)
				res.status(200).json({
					success: true,
					message: 'Weekly timesheets fetched successfully',
					length: timesheets.length,
					data: data
				});

			}
			else {
				return res.status(404).json({
					success: false,
					message: 'No timesheets found for the provided date range',
					data: []
				});
			}

		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	//get timesheets of the current week
	async getCurrentWeekTimeheet(req, res) {
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
			const user_id = '6746a474ed7e5979a3a1f896';
			const today = new Date(); // Reference date (can be any date)
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);
			console.log(weekStartDate, weekEndDate);


			const startDate = new Date(weekStartDate)
			startDate.setUTCHours(0, 0, 0, 0)
			let start = startDate.toISOString()

			const endDate = new Date(weekEndDate)
			endDate.setUTCHours(0, 0, 0, 0)
			endDate.setUTCDate(endDate.getUTCDate() + 1);
			let end = endDate.toISOString()

			const timesheets = await TimesheetRepo.getWeeklyTimesheets(user_id, start, end)

			if (timesheets.length > 0) {
				const data = await Promise.all(
					timesheets.map(async (item) =>
						await timesheetResponse.weeklyTimesheetResponse(item)
					)
				)
				res.status(200).json({
					success: true,
					message: 'Weekly timesheets fetched successfully',
					length: timesheets.length,
					data: data
				});

			}
			else {
				return res.status(404).json({
					success: false,
					message: 'No timesheets found for the provided date range',
					data: []
				});
			}

		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	//get timesheet with are not submitted in current week
	async getDueTimesheets(req, res) {
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
			const user_id = '6746a474ed7e5979a3a1f896';
			const today = new Date(); // Reference date (can be any date)
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);

			const startDate = new Date(weekStartDate)
			startDate.setUTCHours(0, 0, 0, 0)
			let start = startDate.toISOString()

			const endDate = new Date(weekEndDate)
			endDate.setUTCHours(0, 0, 0, 0)
			endDate.setUTCDate(endDate.getUTCDate() + 1);
			let end = endDate.toISOString()

			const timesheets = await TimesheetRepo.getWeeklyTimesheets(user_id, start, end)
			const savedTimesheets = timesheets.filter(timesheet => ((timesheet.status != 'submitted') || (timesheet.status != 'approved')))

			let totalHours = 0;

			savedTimesheets.forEach(timesheet => {
				timesheet.data_sheet.forEach(entry => {
					totalHours += parseFloat(entry.hours);
				});
			});

			const totalHoursPerDate = {};

			savedTimesheets.forEach(timesheet => {
				timesheet.data_sheet.forEach(entry => {
					const date = entry.date;
					const hours = parseFloat(entry.hours);

					if (totalHoursPerDate[date]) {
						totalHoursPerDate[date] += hours;
					} else {
						totalHoursPerDate[date] = hours;
					}
				});
			});

			if (savedTimesheets.length > 0) {
				res.status(200).json({
					success: true,
					message: "Due timesheets fetched successfully",
					length: savedTimesheets.length,
					data: totalHoursPerDate,
					totalHours
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: "No due timesheets",
					data: []
				})
			}
		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	async getProjectSummaryReport(req, res) {
		try {
			const {projectId, Year, Month} = req.body
			const now = new Date();
			let currentYear = now.getFullYear();
			let currentMonth = now.getMonth();
			
			if(Year) currentYear = Year
			if(Month) currentMonth = Month-1

			const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
			const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))

			const report = await TimesheetRepo.projectSummaryReport(startOfMonth, endOfMonth, projectId)
			const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(startOfMonth);

			if (report.length > 0) {
				const data = await Promise.all(
					report.map(async (item) => {
						if (item.projectName) {
							return await timesheetResponse.projectSummaryTimesheetResponse(item, monthName, currentYear);
						}
					}
					)
				)

				res.status(200).json({
					success: true,
					message: 'Project summary report fetched successfully',
					length: report.length,
					data
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: 'Failed to fetch details of given range',
					data:[]
				})
			}
		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	async projectDetailReport(req, res) {
		try {
			const now = new Date();
			let { year, month, projectId, startDate, endDate } = req.body;
	
			if (!year) {
				year = now.getFullYear();
			}
			if (!month) {
				month = now.getMonth() + 1; 
			}
	
			if (!startDate || !endDate) {
				const defaultStartDate = new Date(Date.UTC(year, month - 1, 1)); 
				const defaultEndDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
				startDate = defaultStartDate.toISOString();
				endDate = defaultEndDate.toISOString();
			} else {
				startDate = new Date(startDate).toISOString();
				endDate = new Date(endDate).toISOString();
			}

			const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(startDate));
			
			const report = await TimesheetRepo.projectDetailReport(startDate, endDate,projectId);

			if (report.length > 0) {
				const data = await Promise.all(
					report.map(async (item) => {
						if (item.projectName) {
							return await timesheetResponse.projectSummaryTimesheetResponse(item, monthName, year);
						}
					}
					)
				)

				res.status(200).json({
					success: true,
					message: 'Project detail report fetched successfully',
					length: report.length,
					data
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: 'Failed to fetch details of given range',
					data:[]
				})
			}
		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	async getEmployeeSummaryReport(req, res) {
		try {
			const now = new Date();
			const {projectId, Year, Month, userId } = req.body
			
			let currentYear = now.getFullYear();
			let currentMonth = now.getMonth();

			if(Year) currentYear = Year
			if(Month) currentMonth = Month-1

			const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
			const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))

			const report = await TimesheetRepo.employeeSummaryReport(startOfMonth, endOfMonth, projectId, userId)
			const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(startOfMonth));

			if (report.length > 0) {
				const data = await Promise.all(
					report.map(async (item) => {
						return await timesheetResponse.employeeSummaryTimesheetResponse(item, monthName, currentYear);

					}
					)
				)

				res.status(200).json({
					success: true,
					message: 'Project summary report fetched successfully',
					length: report.length,
					data
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: 'Failed to fetch details of given range',
					data:[]
				})
			}
		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	async getEmployeeDetailReport(req, res) {
		try {
			const now = new Date();
			let { year, month, projectId, startDate, endDate, userId } = req.body;
	
			if (!year) {
				year = now.getFullYear();
			}
			if (!month) {
				month = now.getMonth() + 1; 
			}
	
			if (!startDate || !endDate) {
				const defaultStartDate = new Date(Date.UTC(year, month - 1, 1)); 
				const defaultEndDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
				startDate = defaultStartDate.toISOString();
				endDate = defaultEndDate.toISOString();
			} else {
				startDate = new Date(startDate).toISOString();
				endDate = new Date(endDate).toISOString();
			}


			const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(startDate));
			const report = await TimesheetRepo.employeeDetailReport(startDate,endDate,projectId,userId)
			const range = `${startDate} - ${endDate}`

			if (report.length > 0) {
				const data = await Promise.all(
					report.map(async (item) => {

						return await timesheetResponse.employeeSummaryTimesheetResponse(item, monthName, year);

					}
					)
				)

				res.status(200).json({
					success: true,
					message: 'Project detail report fetched successfully',
					length: report.length,
					range,
					data
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: 'Failed to fetch details of given range',
					data:[]
				})
			}
		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}

	async getTimesheetSnapshot(req, res) {
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
			const user_id = '6746a473ed7e5979a3a1f891';
			let { year, month } = req.body;
	
			const currentDate = new Date();
			year = year || currentDate.getFullYear(); 
			month = month || currentDate.getMonth() + 1;
			const startDate = new Date(Date.UTC(year, month - 1, 1)); 
			const start = startDate.toISOString()
			const endDate = new Date(Date.UTC(year, month, 0));
			const end = endDate.toISOString()

			const timesheetData = await TimesheetRepo.getMonthlySnapshot(user_id,start, end)

			const defaultStatuses = ['saved', 'approved', 'rejected'];
			const responseData = defaultStatuses.map(status => {
			  const existingStatus = timesheetData.find(item => item.status === status);
			  return {
				status,
				count: existingStatus ? existingStatus.count : 0
			  };
			});

			if (timesheetData.length > 0) {
				res.status(200).json({
					success: true,
					message: 'Timesheet Snapshot fetched successfully',
					data: responseData
				})
			}
			else {
				res.status(400).json({
					success: false,
					message: 'No timesheets found for given range',
					data: []
				})
			}

		} catch (err) {
			return res.status(500).json({
				success: false,
				message: err.message,
				data: [],
			});
		}
	}
}
