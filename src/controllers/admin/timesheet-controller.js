import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import TimesheetRepository from '../../repositories/admin/timesheet-repository.js';
import TimesheetRequest from '../../requests/admin/timesheet-request.js'
import FindWeekRange from '../../utils/findWeekRange.js';
import TimesheetResponse from '../../responses/timesheet-response.js';
import findTimezone from '../../utils/findTimeZone.js';
import FindS from '../../utils/findSunday.js';
import getLocalDateStringForTimezone from '../../utils/getLocalDateStringForTimezone.js';


const TimesheetRepo = new TimesheetRepository()

const FindWeekRange_ = new FindWeekRange()

const timesheetResponse = new TimesheetResponse()

// Admin controller to add a timesheet
export default class TimesheetController {

	constructor() {
		// Explicitly bind methods to the class instance
		this.updateTimesheet = this.updateTimesheet.bind(this);
		this.processTimesheets = this.processTimesheets.bind(this);
		this.resolveTimesheetId = this.resolveTimesheetId.bind(this);
		this.updateTimesheetRecords = this.updateTimesheetRecords.bind(this);
		this.handleTimesheetError = this.handleTimesheetError.bind(this);
	}

	/**
 * @swagger
 * /timesheet/save-timesheets:
 *   post:
 *     summary: Update or create timesheets
 *     description: Updates existing timesheets or creates new ones based on the provided data
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
 *                 items:
 *                   type: object
 *                   properties:
 *                     timesheetId:
 *                       type: string
 *                       description: Existing timesheet ID (optional for new timesheets)
 *                     project_id:
 *                       type: string
 *                       description: Project ID (required for new timesheets)
 *                     task_category_id:
 *                       type: string
 *                       description: Task category ID (required for new timesheets)
 *                     task_detail:
 *                       type: string
 *                       description: Details of the task
 *                     status:
 *                       type: string
 *                       enum: [in_progress, saved]
 *                       default: in_progress
 *                     data_sheet:
 *                       type: array
 *                       description: Array of timesheet entries
 *                       items:
 *                         type: object
 *                         required:
 *                           - date
 *                           - hours
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             description: Date of the timesheet entry (must be within timesheet's date range)
 *                           hours:
 *                             type: number
 *                             description: Hours worked on the given date
 *     responses:
 *       200:
 *         description: Timesheets updated or created successfully
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
 *                   example: Timesheets saved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       status:
 *                         type: string
 *                       data_sheet:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             date:
 *                               type: string
 *                               format: date
 *                             hours:
 *                               type: number
 *                             isHoliday:
 *                               type: boolean
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
 *                   example: Invalid or empty timesheets array
 *                 data:
 *                   type: array
 *                   example: []
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
 *                   example: An unexpected error occurred
 *                 data:
 *                   type: array
 *                   example: []
 */

	/**
	 * Updates timesheets for a user
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 * @returns {Promise<Object>} Response object with status and message
	 */

	async updateTimesheet(req, res) {
		try {
			// Authentication (uncomment and implement proper token verification in production)
			// const user_id = await authenticateAndGetUserId(req);
			const user_id = '6746a63bf79ea71d30770de7'; // Temporary user ID

			const timezone = await findTimezone(req);

			const { timesheets } = req.body;

			// Input validation
			if (!Array.isArray(timesheets) || timesheets.length === 0) {
				throw new CustomValidationError('Invalid or empty timesheets array');
			}

			// Validate and process timesheets
			const processedTimesheets = await this.processTimesheets(user_id, timesheets, timezone);

			// Update timesheets
			const updatedTimesheets = await this.updateTimesheetRecords(processedTimesheets);

			return res.status(200).json({
				status: true,
				message: 'Timesheets saved successfully',
				data: updatedTimesheets,
			});
		} catch (err) {
			this.handleTimesheetError(res, err);
		}
	}

	/**
	 * Validates and prepares timesheets for update
	 * @param {string} user_id - User's identifier
	 * @param {Array} timesheets - Array of timesheet data
	 * @returns {Promise<Array>} Processed timesheets
	 */
	async processTimesheets(user_id, timesheets, timezone) {
		return Promise.all(timesheets.map(async (timesheetData) => {
			const {
				timesheetId,
				data_sheet,
				project_id,
				task_category_id,
				task_detail,
				status = 'in_progress'
			} = timesheetData;

			// Create new timesheet if necessary
			const resolvedTimesheetId = await this.resolveTimesheetId({
				timesheetId,
				user_id,
				project_id,
				task_category_id,
				task_detail,
				status,
				timezone
			});

			// Validate existing timesheet
			const { timesheet } = await TimesheetRequest.validateTimesheetAndOwnership(
				resolvedTimesheetId,
				user_id
			);

			// Validate project and data sheet
			await Promise.all([
				TimesheetRequest.validateProjectStatus(timesheet.project_id),
				TimesheetRequest.validateAndProcessDataSheet(data_sheet, timesheet)
			]);

			return {
				timesheetId: resolvedTimesheetId,
				data_sheet
			};
		}));
	}

	/**
	 * Resolves timesheet ID, creating a new timesheet if necessary
	 * @param {Object} params - Timesheet creation parameters
	 * @returns {Promise<string>} Timesheet ID
	 */
	async resolveTimesheetId({
		timesheetId,
		user_id,
		project_id,
		task_category_id,
		task_detail,
		status,
		timezone
	}) {
		// If no timesheetId is provided but required parameters exist, create a new timesheet		
		if (!timesheetId) {

			if (!project_id || !task_category_id) {
				throw new CustomValidationError('Project ID and Task Category ID are required to create a new timesheet');
			}

			// Validate references before creating
			await Promise.all([
				TimesheetRequest.validateReferences(project_id, user_id, task_category_id),
				TimesheetRequest.validateProjectStatus(project_id)
			]);

			// Create a date object for today in the user's timezone, set to start of day
			const today = getLocalDateStringForTimezone(timezone, new Date());

			// Determine week range
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);

			// Create new timesheet
			const newTimesheet = await TimesheetRepo.createTimesheet(
				project_id,
				user_id,
				task_category_id,
				task_detail,
				weekStartDate,
				weekEndDate,
				[], // Empty data_sheet initially
				status
			);

			return newTimesheet._id;
		}

		return timesheetId;
	}

	/**
	 * Updates timesheet records
	 * @param {Array} processedTimesheets - Processed timesheet data
	 * @returns {Promise<Array>} Updated timesheets
	 */
	async updateTimesheetRecords(processedTimesheets) {
		return Promise.all(processedTimesheets.map(async ({ timesheetId, data_sheet }) => {
			return await TimesheetRepo.updateTimesheetData(timesheetId, {
				data_sheet,
				status: 'saved'
			});
		}));
	}

	async handleTimesheetError(res, err) {
		console.error('Timesheet Update Error:', err);

		if (err instanceof CustomValidationError) {
			return res.status(400).json({
				status: false,
				message: err.errors || 'Validation Error',
				data: []
			});
		}

		// Distinguish between different types of errors
		if (err.name === 'ValidationError') {
			return res.status(400).json({
				status: false,
				message: 'Invalid input data',
				data: []
			});
		}

		// Catch-all for unexpected errors
		return res.status(500).json({
			status: false,
			message: 'An unexpected error occurred',
			data: []
		});
	}

	//get all timesheets of a user
	/**
	 * @swagger
	 * /timesheet/get-user-timesheets:
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
			const { page = 1, limit = 10 } = req.body;
			const pageNumber = parseInt(page);
			const limitNumber = parseInt(limit);
			const { timesheets, totalCount } = await TimesheetRepo.getUserTimesheets(user_id, pageNumber, limitNumber);
			// const timesheets = await TimesheetRepo.getUserTimesheets(user_id)

			if (timesheets.length > 0) {
				res.status(200).json({
					success: true,
					message: 'User timesheets fetched successfully',
					data: timesheets,
					pagination: {
						currentPage: page,
						itemsPerPage: limit,
						totalItems: totalCount,
						totalPages: Math.ceil(totalCount / limit)
					}
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
			const user_id = '6746a473ed7e5979a3a1f891';
			const timezone = await findTimezone(req);

			const startOfDay = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
			startOfDay.setUTCHours(0, 0, 0, 0);

			const endOfDay = new Date(startOfDay);
			endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
			endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1);

			const timesheets = await TimesheetRepo.getCurrentDayTimesheets(user_id, startOfDay, endOfDay);

			let totalHours = 0
			timesheets.forEach((item) => {
				totalHours += item.total_hours
			})

			if (timesheets.length > 0) {
				const data = await Promise.all(
					timesheets.map(async (item) =>
						await timesheetResponse.currentDateTimesheetResponse(item)
					)
				)
				res.status(200).json({
					success: true,
					message: 'Current Date timesheets fetched successfully',
					length: timesheets.length,
					data
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

	//get users timesheet for a week
	/**
	 * @swagger
	 * /timesheet/get-weekly-timesheets:
	 *   post:
	 *     summary: Fetch weekly timesheets
	 *     description: Fetch weekly timesheets for a user, grouped by week and including daily details and total hours. Accepts either a specified date range or defaults to the current week.
	 *     tags:
	 *       - Timesheet
	 *     requestBody:
	 *       required: false
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               startDate:
	 *                 type: string
	 *                 format: date
	 *                 example: "2024-12-01"
	 *                 description: Start date of the week (optional).
	 *               endDate:
	 *                 type: string
	 *                 format: date
	 *                 example: "2024-12-07"
	 *                 description: End date of the week (optional).
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
	 *                   example: "Weekly timesheets fetched successfully"
	 *                 length:
	 *                   type: integer
	 *                   example: 1
	 *                 data:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       timesheet_id:
	 *                         type: string
	 *                         example: "67516e4828f913bae93b44d9"
	 *                       project_name:
	 *                         type: string
	 *                         example: "Danti Deals"
	 *                       category_name:
	 *                         type: string
	 *                         example: "UI/UX"
	 *                       task_detail:
	 *                         type: string
	 *                         example: "Worked on this"
	 *                       data_sheet:
	 *                         type: array
	 *                         items:
	 *                           type: object
	 *                           properties:
	 *                             date:
	 *                               type: string
	 *                               format: date
	 *                               example: "2024-12-05T00:00:00.000Z"
	 *                             hours:
	 *                               type: string
	 *                               example: "4:00"
	 *                             normalizedDate:
	 *                               type: string
	 *                               example: "2024-12-05"
	 *                             dayOfWeek:
	 *                               type: string
	 *                               example: "Thu"
	 *                             isHoliday:
	 *                               type: boolean
	 *                               example: false
	 *                             isDisable:
	 *                               type: boolean
	 *                               example: false
	 *                       total_hours:
	 *                         type: integer
	 *                         example: 4
	 *                       status:
	 *                         type: string
	 *                         example: "saved"
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
	 *                   example: "Validation error"
	 *                 errors:
	 *                   type: array
	 *                   items:
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
	 *                   example: "An error occurred while fetching timesheets."
	 */
	async getWeeklyTimesheets(req, res) {
		try {
			// const token = req.headers.authorization?.split(' ')[1];
			// if (!token) {
			//     return res.status(401).json({ 
			//         status: false,
			//         message: 'No token provided',
			//         data: []
			//     });
			// }
			// const decoded = jwt.decode(token);
			// const user_id = decoded.UserId;
			const user_id = '6746a473ed7e5979a3a1f891';

			let { startDate, endDate, prev, next } = req.body;

			let actualStartWeek, actualEndWeek;

			if (startDate && endDate) {
				const validatedDates = await TimesheetRequest.validateDateRange(startDate, endDate);
				if (validatedDates.error) {
					throw new CustomValidationError(validatedDates.error);
				}
				const adjustDates = FindWeekRange_.adjustWeekRange(startDate, endDate, prev, next);
				startDate = new Date(adjustDates.startDate);
				endDate = new Date(adjustDates.endDate);

				// Find actual start and end of the week
				actualStartWeek = FindS.getPreviousSunday(startDate);
				actualEndWeek = new Date(actualStartWeek);
				actualEndWeek.setDate(actualStartWeek.getDate() + 6);
			} else {
				const timezone = await findTimezone(req);
				let today = getLocalDateStringForTimezone(timezone, new Date());

				if (typeof today === "string") {
					today = new Date(today);
				}

				actualStartWeek = FindS.getPreviousSunday(today);
				actualEndWeek = new Date(actualStartWeek);
				actualEndWeek.setDate(actualStartWeek.getDate() + 6);

				startDate = FindWeekRange_.getWeekStartDate(today);
				startDate.setUTCHours(0, 0, 0, 0);
				endDate = FindWeekRange_.getWeekEndDate(today);
			}

				startDate.setUTCHours(0, 0, 0, 0);
				endDate.setUTCHours(0, 0, 0, 0);
				let range = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`;
				const timesheets = await TimesheetRepo.getWeeklyTimesheets(user_id, startDate, endDate);


			if (timesheets.length > 0) {
				const modifydata = timesheets.map((item) => {
					const allDates = FindWeekRange_.getDatesBetween(actualStartWeek, actualEndWeek);
					let total_hours = 0;

					const existingDataMap = new Map(item.data_sheet.map(data => [
						new Date(data.date).toISOString().split('T')[0],
						data
					]));

					// Process all dates for the week
					item.data_sheet = allDates.map(date => {
						const dateString = date.toISOString().split('T')[0];
						const existingData = existingDataMap.get(dateString);
						if (existingData) {
							total_hours += parseFloat(existingData.hours);
							existingData.normalizedDate = dateString;
							existingData.dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
							existingData.isDisable = !(dateString >= startDate.toISOString().split('T')[0] && dateString <= endDate.toISOString().split('T')[0]);
							return existingData;
						} else {
							return {
								date: date,
								hours: '00:00',
								normalizedDate: dateString,
								dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
								isHoliday: false,
								isDisable: !(dateString >= startDate.toISOString().split('T')[0] && dateString <= endDate.toISOString().split('T')[0]),
							};
						}
					});

					item.totalHours = total_hours;
					return item;
				});

				let data = await Promise.all(
					modifydata.map(async (item) => await timesheetResponse.weeklyTimesheetResponse(item))
				);

				data.date_range = range

				res.status(200).json({
					success: true,
					message: 'Weekly timesheets fetched successfully',
					date_range: range,
					data: data,
				});
			} else {
				return res.status(200).json({
					success: false,
					message: 'No timesheets found for the provided date range',
					date_range: range,
					data: [],
				});
			}
		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			} else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: [],
				});
			}
		}
	}

	//get timesheet with are not submitted
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
			const user_id = '6746a473ed7e5979a3a1f891';
			let flag = true
			let { startDate, endDate, prev, next } = req.body;
	
			let actualStartWeek, actualEndWeek;
			const currentYear = new Date().getFullYear();
			const startOfYear = new Date(currentYear, 0, 1);
			const endOfYear = new Date(currentYear, 11, 31);

			if(!prev && !next || (prev && next)) {
				flag = false
			}

			do {
				if (startDate && endDate) {
					const validatedDates = await TimesheetRequest.validateDateRange(startDate, endDate);
					if (validatedDates.error) {
						throw new CustomValidationError(validatedDates.error);
					}
					const adjustDates = FindWeekRange_.adjustWeekRange(startDate, endDate, prev, next);
					startDate = new Date(adjustDates.startDate);
					endDate = new Date(adjustDates.endDate);
	
					// Find actual start and end of the week
					actualStartWeek = FindS.getPreviousSunday(startDate);
					actualEndWeek = new Date(actualStartWeek);
					actualEndWeek.setDate(actualStartWeek.getDate() + 6);
				} else {
					const timezone = await findTimezone(req);
					let today = getLocalDateStringForTimezone(timezone, new Date());
	
					if (typeof today === "string") {
						today = new Date(today);
					}
	
					actualStartWeek = FindS.getPreviousSunday(today);
					actualEndWeek = new Date(actualStartWeek);
					actualEndWeek.setDate(actualStartWeek.getDate() + 6);
	
					startDate = FindWeekRange_.getWeekStartDate(today);
					endDate = FindWeekRange_.getWeekEndDate(today);
				}
	
				startDate.setUTCHours(0, 0, 0, 0);
				endDate.setUTCHours(0, 0, 0, 0);
	
				let range = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`;

				const timesheets = await TimesheetRepo.getWeeklyTimesheets(user_id, startDate, endDate);
	
				if (timesheets.length > 0) {
					const savedTimesheets = timesheets.filter(timesheet => ((timesheet.status != 'submitted') && (timesheet.status != 'accepted')));
	
					if (savedTimesheets.length > 0) {
						const weekDates = [];
						for (let date = new Date(actualStartWeek); date <= actualEndWeek; date.setDate(date.getDate() + 1)) {
							weekDates.push(date.toISOString().split('T')[0]);
						}

						const allDates = FindWeekRange_.getDatesBetween(new Date(startDate), new Date(endDate));
						const normalizedAllDates = allDates.map(date => new Date(date).toISOString().split('T')[0]);
	
						const totalHoursPerDate = {};
						weekDates.forEach(date => {
							totalHoursPerDate[date] = {
								hours: 0,
								isDisable: !normalizedAllDates.includes(date),
							};
						});
						let totalHours = 0;
	
						savedTimesheets.forEach(timesheet => {
							timesheet.data_sheet.forEach(entry => {
								const date = new Date(entry.date).toISOString().split('T')[0];
								const hours = parseFloat(entry.hours);
								if (totalHoursPerDate[date]) {
									totalHoursPerDate[date].hours += hours;
									totalHours += hours;
								}
							});
						});
						totalHoursPerDate.totalHours = totalHours;
	
						return res.status(200).json({
							success: true,
							message: "Due timesheets fetched successfully",
							data: totalHoursPerDate,
							range: range
						});
					}
				}
	
				if ((prev && startDate < startOfYear) || (next && endDate > endOfYear)) {
					break;
				}
			} while (flag);
	
			return res.status(200).json({
				success: false,
				message: prev ? "No due timesheets found after checking to the start of the year" : 
								"No due timesheets found after checking to the end of the year",
				data: [],
				range: `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`
			});
	
		} catch (err) {
			if (err instanceof CustomValidationError) {
				res.status(422).json({
					success: false,
					message: 'Validation error',
					errors: err.errors,
				});
			} else {
				return res.status(500).json({
					success: false,
					message: err.message,
					data: []
				});
			}
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
			let { year, month, projectIds, startDate, endDate, userIds, page = 1, limit = 10 } = req.body;
			const validatedValues = await TimesheetRequest.validateEmployeeDetailParams({ year, month, projectIds, startDate, endDate, userIds })
			if (validatedValues.error) {
				throw new CustomValidationError(validatedValues.error)
			}

			const pageNumber = parseInt(page);
			const limitNumber = parseInt(limit);

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

			const { report, totalCount } = await TimesheetRepo.employeeDetailReport(startDate, endDate, projectIds, userIds, pageNumber, limitNumber);
			const range = `${startDate.split('T')[0]} - ${endDate.split('T')[0]}`

			if (report.length > 0) {
				const data = await Promise.all(
					report.map(async (item) => {
						return await timesheetResponse.employeeSummaryTimesheetResponse(item, monthName, year, range);
					})
				)

				res.status(200).json({
					success: true,
					message: 'Project detail report fetched successfully',
					length: report.length,
					data,
					pagination: {
						currentPage: pageNumber,
						itemsPerPage: limitNumber,
						totalItems: totalCount,
						totalPages: Math.ceil(totalCount / limitNumber)
					}
				})
			}
			else {
				res.status(200).json({
					success: false,
					message: 'Failed to fetch details for given range',
					data: [],
					pagination: {
						currentPage: pageNumber,
						itemsPerPage: limitNumber,
						totalItems: totalCount,
						totalPages: Math.ceil(totalCount / limitNumber)
					}
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

			const defaultStatuses = ['saved', 'accepted', 'rejected'];
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

	//delete timesheet
	/**
	 * @swagger
	 * /timesheet/delete-timesheet:
	 *   post:
	 *     summary: Delete a timesheet entry
	 *     description: Deletes a timesheet entry based on the provided `timesheetId` for the authenticated user.
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
	 *                 description: The ID of the timesheet to be deleted.
	 *                 example: "647f1b3e1234567890abcdef"
	 *     responses:
	 *       200:
	 *         description: Timesheet deleted successfully.
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
	 *                   example: "Timesheet deleted successfully"
	 *                 data:
	 *                   type: array
	 *                   items: {}
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
	 *                   example: "Validation error"
	 *                 errors:
	 *                   type: string
	 *                   example: "Invalid timesheetId"
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
	 *                   example: "An internal server error occurred"
	 *                 data:
	 *                   type: array
	 *                   items: {}
	 */
	async deleteTimesheet(req, res) {
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
			const { timesheetId } = req.body
			const validatedValues = await TimesheetRequest.validateTimesheetDelete(timesheetId, user_id)
			if (validatedValues.error) {
				throw new CustomValidationError(validatedValues.error)
			}

			const deleteTimesheet = await TimesheetRepo.deleteTimesheet(timesheetId)
			if (deleteTimesheet) {
				res.status(200).json({
					success: true,
					message: 'Timesheet deleted successfully',
					data: []
				})
			}
		}
		catch (err) {
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

	//get the status of timesheets previously submitted or saved by user
	/**
	 * @swagger
	 * /timesheet/get-timesheet-status:
	 *   post:
	 *     summary: Get timesheet status count
	 *     description: Retrieves the count of timesheets grouped by status for the current week
	 *     tags:
	 *       - Timesheet
	 *     responses:
	 *       200:
	 *         description: Successful response
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
	 *                   example: Timesheet count fetched successfully
	 *                 data:
	 *                   type: object
	 *                   properties:
	 *                     groupedCounts:
	 *                       type: array
	 *                       items:
	 *                         type: object
	 *                         properties:
	 *                           startDate:
	 *                             type: string
	 *                             format: date
	 *                             example: "2023-05-01"
	 *                           endDate:
	 *                             type: string
	 *                             format: date
	 *                             example: "2023-05-07"
	 *                           totalCount:
	 *                             type: integer
	 *                             example: 5
	 *                           savedCount:
	 *                             type: integer
	 *                             example: 2
	 *                           approvedCount:
	 *                             type: integer
	 *                             example: 2
	 *                           rejectedCount:
	 *                             type: integer
	 *                             example: 1
	 *                     totalCounts:
	 *                       type: object
	 *                       properties:
	 *                         totalTimesheets:
	 *                           type: integer
	 *                           example: 20
	 *                         totalSaved:
	 *                           type: integer
	 *                           example: 8
	 *                         totalApproved:
	 *                           type: integer
	 *                           example: 10
	 *                         totalRejected:
	 *                           type: integer
	 *                           example: 2
	 *       500:
	 *         description: Server error
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
	 *                   example: An error occurred while fetching timesheet count
	 *                 data:
	 *                   type: array
	 *                   items: {}
	 */
	async getStatusCount(req, res) {
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
			const timezone = await findTimezone(req);

			const today = getLocalDateStringForTimezone(timezone, new Date());

			const weekStartDate = FindS.getPreviousSunday(today)
			const weekEndDate = new Date(weekStartDate);
			weekEndDate.setDate(weekStartDate.getDate() + 6);

			const startDate = new Date(weekStartDate)
			startDate.setUTCHours(0, 0, 0, 0)
			let start = startDate.toISOString()

			const timesheet = await TimesheetRepo.timesheetCount(user_id, start)
			res.status(200).json({
				success: true,
				message: 'Timesheet count fetched successfully',
				data: timesheet
			})
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: error.message,
				data: [],
			});
		}
	}

}
