import TimesheetRepository from '../../repositories/admin/timesheet-repo';

const Project = require('../models/Project');  // Assuming Project schema
const User = require('../models/User');        // Assuming User schema
const TaskCategory = require('../models/TaskCategory');  // Assuming TaskCategory schema
const Timesheet = require('../models/Timesheet'); // Assuming Timesheet schema

// Admin controller to add a timesheet

export default class TimesheetController {
	// Controller method to handle adding a timesheet
	async addTimesheet(req, res) {

		// Extract token from Authorization header
		const token = req.headers.authorization?.split(' ')[1];  // 'Bearer <token>'

		if (!token) {
			return res.status(401).json({ message: 'No token provided' });
		}

		// Decode the token without verifying it (get the payload)
		const decoded = jwt.decode(token);  // Decode without verification

		// Now you can get the user_id from the decoded token
		const user_id = decoded.user_id;  // Assuming 'user_id' is stored in the token payload

		const { project_id, task_category_id, task_detail, data_sheet, status } = req.body;

		try {
			// Call the service to create the timesheet
			const result = await TimesheetRepository.createTimesheet(project_id, user_id, task_category_id, task_detail, data_sheet, status);
			return res.status(201).json({ message: 'Timesheet added successfully', data: result });
		} catch (err) {
			return res.status(500).json({ message: err.message });
		}
	}
}
