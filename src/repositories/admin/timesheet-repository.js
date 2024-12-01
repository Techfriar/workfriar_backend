import mongoose from 'mongoose';
import Timesheet from '../../models/timesheet.js'

export default class TimesheetRepository {

	normalizeToUTCDate = (date) => {
		const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
		return normalizedDate;
	};
  
	async getTimesheetById(timesheetId) {
        try {
            // Find the timesheet by its ID
            const timesheet = await Timesheet.findById(timesheetId);

            // Return the timesheet or null if not found
            return timesheet || null;
        } catch (error) {
            console.error(`Error retrieving timesheet with ID ${timesheetId}:`, error);
            throw new Error('Failed to retrieve timesheet');
        }
    }

	// Method to create and save the timesheet
	async createTimesheet(project_id, user_id, task_category_id, task_detail, startDate, endDate, data_sheet=[], status='not submitted') {
		try {
		// Normalize dates to UTC midnight
		const normalizedStartDate = this.normalizeToUTCDate(startDate);
		const normalizedEndDate = this.normalizeToUTCDate(endDate);

		// Create the new timesheet
		const newTimesheet = new Timesheet({
			project_id,
			user_id,
			task_category_id,
			task_detail,
			startDate: normalizedStartDate,
			endDate: normalizedEndDate,
			data_sheet,
			status,
		});

		// Save to the database
		await newTimesheet.save();
		return newTimesheet;
		} catch (err) {
		console.log(err, "sdcs")
		throw new Error('Error while creating timesheet: ' + err.message);
		}
	}

	// Update data_sheet for a specific timesheet
	async updateTimesheetData(timesheetId, { data_sheet, status }) {
		try {
			// Find the timesheet by ID
			const timesheet = await Timesheet.findById(timesheetId);
		
			if (!timesheet) {
				throw new Error('Timesheet not found');
			}
		
			// Check if the timesheet is already submitted or accepted
			if (['submitted', 'accepted'].includes(timesheet.status)) {
				throw new Error('Timesheet cannot be updated as it is already submitted or accepted');
			}
		
			// Validate that data_sheet is an array
			if (!Array.isArray(data_sheet)) {
				throw new Error('Data sheet should be an array');
			}
		
			// Validate each entry in the new data_sheet
			data_sheet.forEach(entry => {
				const { date, isHoliday, hours } = entry;
				if (!date || !hours || typeof isHoliday === 'undefined') {
					throw new Error('Each data sheet entry must contain a date, isHoliday, and hours');
				}
		
				// Check if the date is already present
				const existingEntry = timesheet.data_sheet.find(ds => new Date(ds.date).toISOString() === new Date(date).toISOString());
			
				if (existingEntry) {
					// Update existing entry if date matches
					existingEntry.isHoliday = isHoliday;
					existingEntry.hours = hours;
				} else {
					// Otherwise, add new entry
					timesheet.data_sheet.push({
					date: new Date(date),
					isHoliday,
					hours,
					});
				}
			});
		
			// Set the new status for the timesheet
			timesheet.status = status;
		
			// Save the updated timesheet
			await timesheet.save();
		
			return timesheet;
	} catch (error) {
		throw new Error(`Error updating timesheet: ${error.message}`);
	}
	}
	  
	//Get timesheet using userId
	async getUserTimesheets(userId){
		try {
            return await Timesheet.find({user_id: userId})
        } catch (error) {
            throw new Error(error); 
        }
	}

	//get Timesheet based on current date
	async getCurrentDayTimesheets(userId,startOfDay,endOfDay){
		try {

            return await Timesheet.find({user_id: userId,"data_sheet.date": {
				$gte: startOfDay,
				$lte: endOfDay
			}}).populate('project_id','projectName').lean()
        } catch (error) {
            throw new Error(error); 
        }
	}

	async getWeeklyTimesheets(user_id,startDate,endDate){
		try {
			// Use Mongoose to find timesheets where the startDate and endDate match exactly
			const timesheets = await Timesheet.find({
			  user_id,
			  startDate,
			   endDate
			}).populate('project_id','projectName').lean()
			.populate('task_category_id','category').lean()
	  
			return timesheets;
		  } catch (error) {
			console.error('Error fetching timesheets:', error);
			throw error;
		  }
	}
	
	async projectSummaryReport(start, end, pId) {
		try {
		  const matchStage = {
			$match: {
			  endDate: { $gte: start, $lte: end },
			},
		  };
	  
		  if (pId) {
			matchStage.$match.project_id = new mongoose.Types.ObjectId(pId);
		  }
	  
		  return await Timesheet.aggregate([
			matchStage, 
			{
			  $unwind: { path: "$data_sheet", preserveNullAndEmptyArrays: true },
			},
			{
			  $group: {
				_id: "$project_id",
				loggedHours: {
				  $sum: { $toDouble: "$data_sheet.hours" },
				},
				approvedHours: {
				  $sum: {
					$cond: [
					  { $ne: ["$status", "rejected"] },
					  { $toDouble: "$data_sheet.hours" },
					  0,
					],
				  },
				},
				timesheets: { $push: "$$ROOT" },
			  },
			},
			{
			  $lookup: {
				from: "projects",
				localField: "_id",
				foreignField: "_id",
				as: "projectDetails",
			  },
			},
			{
			  $lookup: {
				from: "categories",
				localField: "timesheets.task_category_id",
				foreignField: "_id",
				as: "taskCategories",
			  },
			},
			{
			  $addFields: {
				projectName: { $arrayElemAt: ["$projectDetails.projectName", 0] },
				categories: {
				  $map: {
					input: "$taskCategories",
					as: "category",
					in: "$$category.category",
				  },
				},
			  },
			},
			{
			  $project: {
				projectDetails: 0,
				taskCategories: 0,
			  },
			},
		  ]).exec();
		} catch (error) {
		  throw new Error(error);
		}
	  }

	async projectDetailReport(startOfMonth,endOfMonth,pId) {

		try {
			const startDate = new Date(startOfMonth);
			const endDate = new Date(endOfMonth);

			const matchStage = {
				$match: {
					endDate: { $gte: startDate, $lte: endDate },
				},
			};
	
			// If pId is provided, add an additional condition for matching project_id
			if (pId) {
				matchStage.$match.project_id = new mongoose.Types.ObjectId(pId);
			}
			return await Timesheet.aggregate([
				matchStage,
				{
					$unwind: { path: "$data_sheet", preserveNullAndEmptyArrays: true },
				},
				{
					$group: {
						_id: "$project_id",
						loggedHours: {
							$sum: { $toDouble: "$data_sheet.hours" },
						},
						approvedHours: {
							$sum: {
								$cond: [
									{ $ne: ["$status", "rejected"] },
									{ $toDouble: "$data_sheet.hours" },
									0,
								],
							},
						},
						timesheets: { $push: "$$ROOT" },
					},
				},
				{
					$lookup: {
						from: "projects",
						localField: "_id",
						foreignField: "_id",
						as: "projectDetails",
					},
				},
				{
					$lookup: {
						from: "categories",
						localField: "timesheets.task_category_id",
						foreignField: "_id",
						as: "taskCategories",
					},
				},
				{
					$addFields: {
						projectName: { $arrayElemAt: ["$projectDetails.projectName", 0] },
						categories: {
							$map: {
								input: "$taskCategories",
								as: "category",
								in: "$$category.category",
							},
						},
					},
				},
				{
					$project: {
						projectDetails: 0, 
						taskCategories: 0,
					},
				},
			]).exec();
		} catch (error) {
			throw new Error(error);
		}
	}

	async employeeSummaryReport(start, end,pId,userId) {
		try {
			const matchStage = {
				$match: {
					endDate: { $gte: start, $lte: end },
				},
			};
	
			// If projectId is provided, add it to the match stage
			if (pId) {
				matchStage.$match.project_id = new mongoose.Types.ObjectId(pId);
			}
	
			// If userId is provided, add it to the match stage
			if (userId) {
				matchStage.$match.user_id = new mongoose.Types.ObjectId(userId);
			}
			return await Timesheet.aggregate([
				matchStage,
				{
					$unwind: { path: "$data_sheet", preserveNullAndEmptyArrays: true },
				},
				{
					$group: {
						_id: { user_id: "$user_id", project_id: "$project_id" },
						loggedHours: {
							$sum: { $toDouble: "$data_sheet.hours" },
						},
						approvedHours: {
							$sum: {
							  $cond: [
								{ $eq: ["$status", "approved"] }, 
								{ $toDouble: "$data_sheet.hours" }, 
								0, 
							  ],
							},
						},
						timesheets: { $push: "$$ROOT" },
					},
				},
				{
					$lookup: {
						from: "projects",
						localField: "_id.project_id",
						foreignField: "_id",
						as: "projectDetails",
					},
				},
				{
					$lookup: {
						from: "categories",
						localField: "timesheets.task_category_id",
						foreignField: "_id",
						as: "taskCategories",
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "_id.user_id",
						foreignField: "_id",
						as: "userDetails",
					},
				},
				{
					$addFields: {
						projectName: { 
							$arrayElemAt: ["$projectDetails.projectName", 0] // Access the first item of the projectDetails array
						},
						categories: {
							$map: {
								input: "$taskCategories",
								as: "category",
								in: "$$category.category",
							},
						},
						userName: { $arrayElemAt: ["$userDetails.full_name", 0] },
					},
				},
				{
					$project: {
						projectDetails: 0, // Remove projectDetails array
						taskCategories: 0,
						userDetails: 0,
						timesheets: 0,
					},
				},
				{
					$group: {
						_id: "$userName",
						projects: {
							$push: {
								projectName: "$projectName",
								project_id: "$_id.project_id",
								loggedHours: "$loggedHours",
								approvedHours: "$approvedHours",
								categories: "$categories",
							},
						},
						totalLoggedHours: { $sum: "$loggedHours" },
						totalApprovedHours: { $sum: "$approvedHours" },
					},
				},
				{
					$sort: { _id: 1 },
				},
			]).exec();
		} catch (error) {
			throw new Error(error);
		}
	}
	
	async employeeDetailReport(start,end,pId,userId) {
		try {
			const startDate = new Date(start);
			const endDate = new Date(end);

			const matchStage = {
				$match: {
					endDate: { $gte: startDate, $lte: endDate },
				},
			};
	
			// If pId is provided, add an additional condition for matching project_id
			if (pId) {
				matchStage.$match.project_id = new mongoose.Types.ObjectId(pId);
			}

			if (userId) {
				matchStage.$match.user_id = new mongoose.Types.ObjectId(userId);
			}

			return await Timesheet.aggregate([
				matchStage,
				{
					$unwind: { path: "$data_sheet", preserveNullAndEmptyArrays: true },
				},
				{
					$group: {
						_id: { user_id: "$user_id", project_id: "$project_id" },
						loggedHours: {
							$sum: { $toDouble: "$data_sheet.hours" },
						},
						approvedHours: {
							$sum: {
							  $cond: [
								{ $eq: ["$status", "approved"] }, 
								{ $toDouble: "$data_sheet.hours" }, 
								0, 
							  ],
							},
						},
						timesheets: { $push: "$$ROOT" },
					},
				},
				{
					$lookup: {
						from: "projects",
						localField: "_id.project_id",
						foreignField: "_id",
						as: "projectDetails",
					},
				},
				{
					$lookup: {
						from: "categories",
						localField: "timesheets.task_category_id",
						foreignField: "_id",
						as: "taskCategories",
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "_id.user_id",
						foreignField: "_id",
						as: "userDetails",
					},
				},
				{
					$addFields: {
						projectName: { 
							$arrayElemAt: ["$projectDetails.projectName", 0] // Access the first item of the projectDetails array
						},
						categories: {
							$map: {
								input: "$taskCategories",
								as: "category",
								in: "$$category.category",
							},
						},
						userName: { $arrayElemAt: ["$userDetails.full_name", 0] },
					},
				},
				{
					$project: {
						projectDetails: 0, // Remove projectDetails array
						taskCategories: 0,
						userDetails: 0,
						timesheets: 0,
					},
				},
				{
					$group: {
						_id: "$userName",
						projects: {
							$push: {
								projectName: "$projectName",
								project_id: "$_id.project_id",
								loggedHours: "$loggedHours",
								approvedHours: "$approvedHours",
								categories: "$categories",
							},
						},
						totalLoggedHours: { $sum: "$loggedHours" },
						totalApprovedHours: { $sum: "$approvedHours" },
					},
				},
				{
					$sort: { _id: 1 },
				},
			]).exec();
		} catch (error) {
			throw new Error(error);
		}
	}
	
	async getMonthlySnapshot(userId, start, endDate) {
		try {
		  const startDate = new Date(start);
		  const end = new Date(endDate);

		  return await Timesheet.aggregate([
			{
			  $match: {
				user_id: new mongoose.Types.ObjectId(userId),
				endDate: {
				  $gte: startDate, 
				  $lte: end 
				}
			  }
			},
			{
			  $group: {
				_id: "$status",
				count: { $sum: 1 } 
			  }
			},
			{
			  $project: {
				_id: 0, 
				status: "$_id", 
				count: 1
			  }
			}
		  ]);
		} catch (error) {
		  console.error("Error in getMonthlySnapshot:", error);
		  throw new Error(error.message || "An error occurred");
		}
	  }
	  
	

}

