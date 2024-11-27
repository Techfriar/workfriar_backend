import TimesheetRepository from '../../repositories/admin/timesheet-repository.js';
// import TimesheetRequest from '../../requests/admin/timesheet-request.js'
import FindSunday from '../../services/findSunday.js';

const TimesheetRepo = new TimesheetRepository()
// const TimesheetReq = new TimesheetRequest()
const FindSunday_ = new FindSunday()

// Admin controller to add a timesheet
export default class TimesheetController {

	/**
 * @swagger
 * /timesheet:
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
			// 	return res.status(401).json({ message: 'No token provided' });
			// }

			// // Decode the token without verifying it (get the payload)
			// const decoded = jwt.decode(token);  // Decode without verification

			// const user_id = decoded.UserId; 

			// 6746a473ed7e5979a3a1f891 - user

			const user_id = '6746a473ed7e5979a3a1f891'

			const { project_id, task_category_id, task_detail, data_sheet=[], status='not submitted' } = req.body;

			// await TimesheetReq.validateReferences(project_id, user_id, task_category_id)

			const startDate = Date.now()
			const endDate = await FindSunday_.getNextSunday()
			// Call the Repository to create the timesheet
			await TimesheetRepo.createTimesheet(project_id, user_id, task_category_id, task_detail, startDate, endDate, data_sheet, status);
			 
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
}
