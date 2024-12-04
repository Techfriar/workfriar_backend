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

const FindWeekRange_ = new FindWeekRange()
const IsDateInRange_ = new IsDateInRange()

const timesheetResponse = new TimesheetResponse()

// Admin controller to add a timesheet
export default class TimesheetController {

	/**
	 * @swagger
	 * /timesheet/add-timesheet:
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

			const user_id = '6746a63bf79ea71d30770de7'

			const { project_id, task_category_id, task_detail, data_sheet = [], status = 'in_progress' } = req.body;

			await TimesheetRequest.validateReferences(project_id, user_id, task_category_id)
			await TimesheetRequest.validateProjectStatus(project_id)

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
	 * /timesheet/save-timesheets:
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

			const user_id = '6746a63bf79ea71d30770de7'; // Replace this with decoded user ID from the token in production
			const { timesheets } = req.body;

			// Validate request input and timesheet ownership 
			const validatedTimesheets = await Promise.all(timesheets.map(async ({ timesheetId, data_sheet }) => {
				const timesheetValidationError = await TimesheetRequest.validateTimesheetAndOwnership(timesheetId, user_id)
				const { timesheet } = timesheetValidationError; // Extract validated timesheet 
				// Validate and process data_sheet items 
				await TimesheetRequest.validateAndProcessDataSheet(data_sheet, timesheet);

				// Validate Project Status
				await TimesheetRequest.validateProjectStatus(timesheet.project_id)

				return { timesheetId, data_sheet, timesheet };
			})); // Update each timesheet 

			const updatedTimesheets = await Promise.all(validatedTimesheets.map(async ({ timesheetId, data_sheet }) => {
				return await TimesheetRepo.updateTimesheetData(timesheetId, { data_sheet, status: 'saved', });
			}));

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
				res.status(200).json({
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

	/**
	 * @swagger
	 * /timesheet/submit-timesheets:
	 *   post:
	 *     summary: Submit multiple timesheets
	 *     description: Updates the status of the provided timesheets to "Submit".
	 *     tags:
	 *       - Timesheet
	 *     security:
	 *       - bearerAuth: []  # Use bearer token authentication
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               timesheets:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 example: ["63f3a2a3e13c2312d1234567", "63f3a2a3e13c2312d1234568"]
	 *                 description: Array of timesheet IDs to be submitted.
	 *     responses:
	 *       200:
	 *         description: Timesheets submitted successfully.
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
	 *                   example: "Timesheets submitted successfully"
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       timesheetId:
	 *                         type: string
	 *                         example: "63f3a2a3e13c2312d1234567"
	 *                       status:
	 *                         type: string
	 *                         example: "Submit"
	 *       400:
	 *         description: Validation error or bad request.
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
	 *                   example: "Invalid timesheet ID or ownership validation failed."
	 *                 data:
	 *                   type: array
	 *                   example: []
	 *       401:
	 *         description: Unauthorized, missing or invalid token.
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
	 *                   example: "No token provided"
	 *                 data:
	 *                   type: array
	 *                   example: []
	 *       500:
	 *         description: Internal server error.
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
	 *                   example: "An unexpected error occurred"
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

	async submitTimesheet(req, res) {
		try {
			// Extract token and user ID
			// In production, decode the token to get the user ID
			const user_id = '6744a7c9707ecbeea1efd14c'; // Replace with decoded user ID in production
			const { timesheets } = req.body;

			// Validate request input and timesheet ownership
			const validatedTimesheets = await Promise.all(
				timesheets.map(async (timesheetId) => {
					const timesheetValidationError = await TimesheetRequest.validateTimesheetAndOwnership(timesheetId, user_id);
					const { timesheet } = timesheetValidationError; // Extract validated timesheet
					await TimesheetRequest.validateProjectStatus(timesheet.project_id) // Validate Project Status
					return timesheetId;
				})
			);

			// Update each timesheet status to "Submit"
			const updatedTimesheets = await Promise.all(
				validatedTimesheets.map(async (timesheetId) => {
					return await TimesheetRepo.submitTimesheet(timesheetId);
				})
			);

			return res.status(200).json({
				status: true,
				message: 'Timesheets submitted successfully',
				data: updatedTimesheets,
			});
		} catch (err) {
			if (err instanceof CustomValidationError) {
				return res.status(400).json({
					status: false,
					message: err.errors,
					data: [],
				});
			}
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
	 * /timesheet/get-current-day-timesheets:
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
				res.status(200).json({
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
	/**
	 * @swagger
	 * /timesheet/filter-weekly-timesheets:
	 *   post:
	 *     summary: Filter weekly timesheets by date range
	 *     description: Fetches weekly timesheets for a user based on the provided start and end dates.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               startDate:
	 *                 type: string
	 *                 format: date
	 *                 description: The start date of the timesheet range (YYYY-MM-DD).
	 *                 example: 2024-11-01
	 *               endDate:
	 *                 type: string
	 *                 format: date
	 *                 description: The end date of the timesheet range (YYYY-MM-DD).
	 *                 example: 2024-11-07
	 *     responses:
	 *       200:
	 *         description: Weekly timesheets fetched successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Weekly timesheets fetched successfully
	 *                 length:
	 *                   type: integer
	 *                   example: 2
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       id:
	 *                         type: string
	 *                         example: 64cfc73edfa4d2787b5ed3a7
	 *                       date:
	 *                         type: string
	 *                         format: date
	 *                         example: 2024-11-03
	 *                       hours:
	 *                         type: number
	 *                         example: 8
	 *                       status:
	 *                         type: string
	 *                         example: saved
	 *       422:
	 *         description: Validation error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Validation error
	 *                 errors:
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *                     example: "startDate is required and must be a valid date"
	 *       500:
	 *         description: Server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Internal server error
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

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
			const user_id = '6746a473ed7e5979a3a1f891';
			const { startDate, endDate } = req.body
			const validatedDates = await TimesheetRequest.validateDateRange(startDate, endDate);
			if (validatedDates.error) {
				// If there are validation errors, return a error
				throw new CustomValidationError(validationResult.error)

			}
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
				return res.status(200).json({
					success: false,
					message: 'No timesheets found for the provided date range',
					data: []
				});
			}

		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			}
			else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: []
				});
			}
		}
	}

	//get timesheets of the current week
	/**
	 * @swagger
	 * /timesheet/get-current-week-timesheets:
	 *   post:
	 *     summary: Get timesheets for the current week
	 *     description: Fetches the timesheets for the current week for the logged-in user.
	 *     tags:
	 *       - Timesheet
	 *     responses:
	 *       200:
	 *         description: Weekly timesheets fetched successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Weekly timesheets fetched successfully
	 *                 length:
	 *                   type: integer
	 *                   example: 5
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       id:
	 *                         type: string
	 *                         example: 64cfc73edfa4d2787b5ed3a7
	 *                       date:
	 *                         type: string
	 *                         format: date
	 *                         example: 2024-12-01
	 *                       hours:
	 *                         type: number
	 *                         example: 8
	 *                       status:
	 *                         type: string
	 *                         example: saved
	 *       500:
	 *         description: Server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Internal server error
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

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
			const user_id = '6746a473ed7e5979a3a1f891';
			const today = new Date(); // Reference date (can be any date)
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);

			const startDate = new Date(weekStartDate)
			startDate.setUTCHours(0, 0, 0, 0)
			let start = startDate.toISOString()

			const endDate = new Date(weekEndDate)
			endDate.setUTCHours(0, 0, 0, 0)
			endDate.setUTCDate(endDate.getUTCDate());
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
				return res.status(200).json({
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
	/**
	 * @swagger
	 * /timesheet/get-due-timesheets:
	 *   post:
	 *     summary: Get due timesheets
	 *     description: Fetches the timesheets that are not submitted or approved for the current week for the logged-in user.
	 *     tags:
	 *       - Timesheet
	 *     responses:
	 *       200:
	 *         description: Due timesheets fetched successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Due timesheets fetched successfully
	 *                 length:
	 *                   type: integer
	 *                   example: 2
	 *                 data:
	 *                   type: object
	 *                   additionalProperties:
	 *                     type: number
	 *                   example: 
	 *                     "2024-12-01": 8
	 *                     "2024-12-02": 6.5
	 *                 totalHours:
	 *                   type: number
	 *                   example: 14.5
	 *       500:
	 *         description: Server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Internal server error
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

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
			const user_id = '6746a473ed7e5979a3a1f891';
			const today = new Date(); // Reference date (can be any date)
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);

			const startDate = new Date(weekStartDate)
			startDate.setUTCHours(0, 0, 0, 0)
			let start = startDate.toISOString()

			const endDate = new Date(weekEndDate)
			endDate.setUTCHours(0, 0, 0, 0)
			endDate.setUTCDate(endDate.getUTCDate());
			let end = endDate.toISOString()

			const timesheets = await TimesheetRepo.getWeeklyTimesheets(user_id, start, end)
			console.log(timesheets);
			
			const savedTimesheets = timesheets.filter(timesheet => ((timesheet.status != 'submitted') || (timesheet.status != 'approved')))


			const weekDates = [];
			for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
				weekDates.push(date.toISOString().split('T')[0]); 
			}
	
			const totalHoursPerDate = {};
			weekDates.forEach(date => {
				totalHoursPerDate[date] = 0;
			});
	
			let totalHours = 0;
	
			savedTimesheets.forEach(timesheet => {
				timesheet.data_sheet.forEach(entry => {

					const date = new Date(entry.date).toISOString().split('T')[0];
					const hours = parseFloat(entry.hours);

					totalHoursPerDate[date] = (totalHoursPerDate[date] || 0) + hours;
					totalHours += hours;
				});
			});
			totalHoursPerDate.totalHours = totalHours;

			if (savedTimesheets.length > 0) {
				res.status(200).json({
					success: true,
					message: "Due timesheets fetched successfully",
					length: savedTimesheets.length,
					data: totalHoursPerDate,
					
				})
			}
			else {
				res.status(200).json({
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

	//get project summary report
	/**
	 * @swagger
	 * /timesheet/get-project-summary-report:
	 *   post:
	 *     summary: Fetch the project summary report for specific projects and a specific month and year.
	 *     description: Retrieves a project summary report based on the provided project IDs, year, and month. 
	 *                  The report includes detailed information about the timesheets related to the projects.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               projectIds:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Array of project IDs to fetch the summary for.
	 *                 example: ["6746a474ed7e5979a3a1f896", "89db74e17a46972b4c56f12e"]
	 *               year:
	 *                 type: integer
	 *                 description: The year for the report.
	 *                 example: 2024
	 *               month:
	 *                 type: integer
	 *                 description: The month (1-12) for the report.
	 *                 example: 11
	 *     responses:
	 *       200:
	 *         description: Successfully fetched the project summary report.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Project summary report fetched successfully
	 *                 length:
	 *                   type: integer
	 *                   example: 3
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       projectName:
	 *                         type: string
	 *                         example: "Website Redesign Project"
	 *                       month:
	 *                         type: string
	 *                         example: "November"
	 *                       year:
	 *                         type: integer
	 *                         example: 2024
	 *                       totalHours:
	 *                         type: number
	 *                         example: 120.5
	 *       422:
	 *         description: Validation error for input parameters.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Validation error
	 *                 errors:
	 *                   type: object
	 *                   additionalProperties:
	 *                     type: string
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: An unexpected error occurred.
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

	async getProjectSummaryReport(req, res) {
		try {
			const { projectIds, year, month } = req.body


			const validatedParams = await TimesheetRequest.validateProjectSummaryParams({ projectIds, year, month });
			if (validatedParams.error) {
				// If there are validation errors, return a error
				throw new CustomValidationError(validatedParams.error)

			}
			const now = new Date();
			let currentYear = now.getFullYear();
			let currentMonth = now.getMonth();

			if (year) currentYear = year
			if (month) currentMonth = month - 1

			const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
			const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))

			const report = await TimesheetRepo.projectSummaryReport(startOfMonth, endOfMonth, validatedParams.projectIds)
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
				res.status(200).json({
					success: false,
					message: 'Failed to fetch details',
					data: []
				})
			}
		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			}
			else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: []
				});
			}
		}
	}

	//get detailed report on project
	/**
	 * @swagger
	 * /timesheet/get-project-detail-report:
	 *   post:
	 *     summary: Fetch the project detail report for a specified period.
	 *     description: Retrieves detailed timesheet data for a project within a specified date range or for a default month and year.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               projectIds:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Array of project IDs to fetch the summary for.
	 *                 example: ["6746a474ed7e5979a3a1f896", "89db74e17a46972b4c56f12e"]
	 *               year:
	 *                 type: integer
	 *                 description: The year for the report. Defaults to the current year if not provided.
	 *                 example: 2024
	 *               month:
	 *                 type: integer
	 *                 description: The month (1-12) for the report. Defaults to the current month if not provided.
	 *                 example: 11
	 *               startDate:
	 *                 type: string
	 *                 format: date-time
	 *                 description: Custom start date for the report in ISO format. Overrides year and month.
	 *                 example: "2024-11-01T00:00:00Z"
	 *               endDate:
	 *                 type: string
	 *                 format: date-time
	 *                 description: Custom end date for the report in ISO format. Overrides year and month.
	 *                 example: "2024-11-30T23:59:59Z"
	 *     responses:
	 *       200:
	 *         description: Successfully fetched the project detail report.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Project detail report fetched successfully
	 *                 length:
	 *                   type: integer
	 *                   example: 5
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       projectName:
	 *                         type: string
	 *                         example: "Website Redesign Project"
	 *                       month:
	 *                         type: string
	 *                         example: "November"
	 *                       year:
	 *                         type: integer
	 *                         example: 2024
	 *                       totalHours:
	 *                         type: number
	 *                         example: 150.75
	 *       422:
	 *         description: Validation error for input parameters.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Validation error
	 *                 errors:
	 *                   type: object
	 *                   additionalProperties:
	 *                     type: string
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: An unexpected error occurred.
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

	async projectDetailReport(req, res) {
		try {
			const now = new Date();
			let { year, month, projectIds, startDate, endDate } = req.body;
			const validatedValues = await TimesheetRequest.validateProjectDetailReportParams({ year, month, projectIds, startDate, endDate })
			if (validatedValues.error) {
				throw new CustomValidationError(validatedValues.error)
			}
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

			const report = await TimesheetRepo.projectDetailReport(startDate, endDate, projectIds);

			if (report.length > 0) {
				const data = await Promise.all(
					report.map(async (item) => {
						if (item.projectName) {
							return await timesheetResponse.projectDetailTimesheetResponse(item, monthName, year, startDate, endDate);
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
				res.status(200).json({
					success: false,
					message: 'Failed to fetch details',
					data: []
				})
			}
		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			}
			else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: []
				});
			}
		}
	}

	//get employee summary report
	/**
	 * @swagger
	 * /timesheet/get-employee-summary-report:
	 *   post:
	 *     summary: Fetch the employee summary report for a specified month and project.
	 *     description: Retrieves summarized timesheet data for employees within specified projects and months.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               projectIds:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Array of project IDs for which the employee summary report is to be generated. If provided, all project IDs will be validated.
	 *                 example: ["6746a474ed7e5979a3a1f896", "5f43a274be8f7e6193a2d456"]
	 *               year:
	 *                 type: integer
	 *                 description: The year for the report. Defaults to the current year if not provided.
	 *                 example: 2024
	 *               month:
	 *                 type: integer
	 *                 description: The month (1-12) for the report. Defaults to the current month if not provided.
	 *                 example: 11
	 *               userIds:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Array of employee IDs whose summary reports are to be fetched. If provided, all user IDs will be validated.
	 *                 example: ["1a2b3c4d5e6f7g8h9i0j", "2b3c4d5e6f7g8h9i0k1l"]
	 *     responses:
	 *       200:
	 *         description: Successfully fetched the employee summary report.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Employee summary report fetched successfully
	 *                 length:
	 *                   type: integer
	 *                   example: 5
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       employeeName:
	 *                         type: string
	 *                         example: "John Doe"
	 *                       projectName:
	 *                         type: string
	 *                         example: "Website Redesign Project"
	 *                       month:
	 *                         type: string
	 *                         example: "November"
	 *                       year:
	 *                         type: integer
	 *                         example: 2024
	 *                       totalHours:
	 *                         type: number
	 *                         example: 120.50
	 *       422:
	 *         description: Validation error for input parameters.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Validation error
	 *                 errors:
	 *                   type: object
	 *                   additionalProperties:
	 *                     type: string
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: An unexpected error occurred.
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

	async getEmployeeSummaryReport(req, res) {
		try {
			const now = new Date();
			const { projectIds, year, month, userIds } = req.body

			const validatedValues = await TimesheetRequest.validateEmployeeSummaryParams({ projectIds, year, month, userIds })

			if (validatedValues.error) {
				throw new CustomValidationError(validatedValues.error)
			}
			let currentYear = now.getFullYear();
			let currentMonth = now.getMonth();

			if (year) currentYear = year
			if (month) currentMonth = month - 1

			const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
			const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999))


			const report = await TimesheetRepo.employeeSummaryReport(startOfMonth, endOfMonth, projectIds, userIds)

			const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(startOfMonth));

			if (report.length > 0) {

				const data = await Promise.all(
					report.map(async (item) => {
						return await timesheetResponse.employeeSummaryTimesheetResponse(item, monthName, currentYear);
					})
				);


				res.status(200).json({
					success: true,
					message: 'Employee summary report fetched successfully',
					length: report.length,
					data
				})
			}
			else {
				res.status(200).json({
					success: false,
					message: 'Failed to fetch details',
					data: []
				})
			}
		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			}
			else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: []
				});
			}
		}
	}

	//get detailed report of employee
	/**
	 * @swagger
	 * /timesheet/get-employee-detail-report:
	 *   post:
	 *     summary: Fetch the employee detailed report for a specified date range and project(s).
	 *     description: Retrieves detailed timesheet data for an employee within a specified project(s), date range, and month.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               year:
	 *                 type: integer
	 *                 description: The year for the report. Defaults to the current year if not provided.
	 *                 example: 2024
	 *               month:
	 *                 type: integer
	 *                 description: The month (1-12) for the report. Defaults to the current month if not provided.
	 *                 example: 11
	 *               projectIds:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Array of project IDs for which the employee detail report is to be generated.
	 *                 example: ["6746a474ed7e5979a3a1f896", "5e34d4b5c4567e8d98f4a5b9"]
	 *               startDate:
	 *                 type: string
	 *                 format: date
	 *                 description: The start date for the report range in ISO format. Defaults to the first day of the month if not provided.
	 *                 example: "2024-11-01"
	 *               endDate:
	 *                 type: string
	 *                 format: date
	 *                 description: The end date for the report range in ISO format. Defaults to the last day of the month if not provided.
	 *                 example: "2024-11-30"
	 *               userIds:
	 *                 type: array
	 *                 items:
	 *                   type: string
	 *                 description: Array of employee IDs whose detailed report is to be fetched.
	 *                 example: ["1a2b3c4d5e6f7g8h9i0j", "5a7b9c2d3e4f5g6h7i8j"]
	 *     responses:
	 *       200:
	 *         description: Successfully fetched the employee detail report.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Project detail report fetched successfully
	 *                 length:
	 *                   type: integer
	 *                   example: 5
	 *                 range:
	 *                   type: string
	 *                   example: "2024-11-01 - 2024-11-30"
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       employeeName:
	 *                         type: string
	 *                         example: "John Doe"
	 *                       projectName:
	 *                         type: string
	 *                         example: "Website Redesign Project"
	 *                       date:
	 *                         type: string
	 *                         format: date
	 *                         example: "2024-11-05"
	 *                       hoursWorked:
	 *                         type: number
	 *                         example: 8
	 *       422:
	 *         description: Validation error for input parameters.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Validation error
	 *                 errors:
	 *                   type: object
	 *                   additionalProperties:
	 *                     type: string
	 *       500:
	 *         description: Internal server error.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: An unexpected error occurred.
	 *                 data:
	 *                   type: array
	 *                   example: []
	 */

	async getEmployeeDetailReport(req, res) {
		try {
			const now = new Date();
			let { year, month, projectIds, startDate, endDate, userIds } = req.body;
			const validatedValues = await TimesheetRequest.validateEmployeeSummaryParams({ year, month, projectIds, startDate, endDate, userIds })
			if (validatedValues.error) {
				throw new CustomValidationError(validatedValues.error)
			}

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

			const report = await TimesheetRepo.employeeDetailReport(startDate, endDate, projectIds, userIds)

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
				res.status(200).json({
					success: false,
					message: 'Failed to fetch details of given range',
					data: []
				})
			}
		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			}
			else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: []
				});
			}
		}
	}

	//get a snapshot based on month
	/**
	 * @swagger
	 * /timesheet/get-timesheet-snapshot:
	 *   post:
	 *     summary: Fetches a snapshot of the timesheet for a given year and month
	 *     description: Returns a summary of timesheet status (saved, approved, rejected) counts for the specified year and month.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               year:
	 *                 type: integer
	 *                 description: The year for the snapshot (optional, defaults to current year).
	 *                 example: 2024
	 *               month:
	 *                 type: integer
	 *                 description: The month for the snapshot (optional, defaults to current month).
	 *                 example: 12
	 *     responses:
	 *       200:
	 *         description: Successfully fetched timesheet snapshot
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: true
	 *                 message:
	 *                   type: string
	 *                   example: Timesheet Snapshot fetched successfully
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       status:
	 *                         type: string
	 *                         example: approved
	 *                       count:
	 *                         type: integer
	 *                         example: 5
	 *       422:
	 *         description: Validation error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Validation error
	 *                 errors:
	 *                   type: array
	 *                   items:
	 *                     type: string
	 *       500:
	 *         description: Internal server error
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 success:
	 *                   type: boolean
	 *                   example: false
	 *                 message:
	 *                   type: string
	 *                   example: Internal server error
	 *                 data:
	 *                   type: array
	 *                   items: {}
	 */
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
			const validatedValues = await TimesheetRequest.validateYearMonth({ year, month })
			if (validatedValues.error) {
				throw new CustomValidationError(validatedValues.error)
			}

			const currentDate = new Date();
			year = year || currentDate.getFullYear();
			month = month || currentDate.getMonth() + 1;
			const startDate = new Date(Date.UTC(year, month - 1, 1));
			const start = startDate.toISOString()
			const endDate = new Date(Date.UTC(year, month, 0));
			const end = endDate.toISOString()

			const timesheetData = await TimesheetRepo.getMonthlySnapshot(user_id, start, end)

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
				res.status(200).json({
					success: false,
					message: 'No timesheets found for given range',
					data: []
				})
			}

		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			}
			else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: []
				});
			}
		}
	}



}
