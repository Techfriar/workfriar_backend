import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import TimesheetRepository from '../../repositories/admin/timesheet-repository.js';
import TimesheetRequest from '../../requests/admin/timesheet-request.js'
import FindWeekRange from '../../services/findWeekRange.js';

const TimesheetRepo = new TimesheetRepository()

const FindWeekRange_ = new FindWeekRange()

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

            const user_id = '6744a7c9707ecbeea1efd14c'

			const { project_id, task_category_id, task_detail, data_sheet=[], status='in_progress' } = req.body;

			await TimesheetRequest.validateReferences(project_id, user_id, task_category_id)
			await TimesheetRequest.validateProjectStatus(project_id)

			const today = new Date(); // Reference date (can be any date)
			const { weekStartDate, weekEndDate } = FindWeekRange_.getWeekRange(today);
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

			const user_id = '6744a7c9707ecbeea1efd14c'; // Replace this with decoded user ID from the token in production
			const { timesheets } = req.body;

			// Validate request input and timesheet ownership 
			const validatedTimesheets = await Promise.all(timesheets.map(async ({ timesheetId, data_sheet }) => { 
				const timesheetValidationError = await TimesheetRequest.validateTimesheetAndOwnership(timesheetId, user_id)
				const { timesheet } = timesheetValidationError; // Extract validated timesheet 
				// Validate and process data_sheet items 
				await TimesheetRequest.validateAndProcessDataSheet(data_sheet, timesheet);
				
				// Validate Project Status
				await TimesheetRequest.validateProjectStatus(timesheet.project_id)

				return { timesheetId, data_sheet, timesheet }; })); // Update each timesheet 
				
			const updatedTimesheets = await Promise.all(validatedTimesheets.map(async ({ timesheetId, data_sheet }) => { 
				return await TimesheetRepo.updateTimesheetData(timesheetId, { data_sheet, status: 'saved', }); 
			}));

			return res.status(200).json({
				status: true,
				message: 'Timesheets saved successfully',
				data: updatedTimesheets,
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
	
}
