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
	async createTimesheet(project_id, user_id, task_category_id, task_detail, startDate, endDate, data_sheet = []) {
		const status = 'saved'
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

			throw new Error('Error while creating timesheet: ' + err.message);
		}
	}

	// Update data_sheet for a specific timesheet
	async updateTimesheetData(timesheetId, { data_sheet, status, task_detail }) {
		try {
			// Find the timesheet by ID
			const timesheet = await Timesheet.findById(timesheetId)
				.populate({
					path: 'project_id',
					select: 'project_name description status categories',
				})
				.populate({
					path: 'task_category_id',
					select: 'category time_entry', // Fields from Category schema
				});

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

			if(task_detail) {
				timesheet.task_detail = task_detail;
			}

			// Save the updated timesheet
			await timesheet.save();
 
			return { 
				timesheet_id: timesheet._id,
                category_name:timesheet.task_category_id.category,
                project_name:timesheet.project_id.project_name,
                ...timesheet.toObject(),
			};
		} catch (error) {
			throw new Error(`Error updating timesheet: ${error.message}`);
		}
	}

	// Submit a specific timesheet by updating its status to "submitted"
	async submitTimesheet(timesheetId) {
		try {
			// Find the timesheet by ID
			const timesheet = await Timesheet.findById(timesheetId);

			if (!timesheet) {
				throw new Error('Timesheet not found');
			}

			// Update the status to "submitted"
			timesheet.status = 'submitted';

			// Save the updated timesheet
			await timesheet.save();

			return timesheet;
		} catch (error) {
			throw new Error(`Error submitting timesheet: ${error.message}`);
		}
	}


	//Get timesheet using userId
	async getUserTimesheets(user_id, page, limit) {
		try {
			const skip = (page - 1) * limit;

			const timesheets = await Timesheet.find({ user_id })
				.skip(skip)
				.limit(limit);

			const totalCount = await Timesheet.countDocuments({ user_id });

			return { timesheets, totalCount };
		} catch (error) {
			throw new Error(error);
		}
	}

	//get Timesheet based on current date
	async getCurrentDayTimesheets(userId, startOfDay, endOfDay) {
		try {
			const timesheets = await Timesheet.aggregate([
				{
					$match: {
						user_id: new mongoose.Types.ObjectId(userId),
						"data_sheet.date": {
							$gte: startOfDay,
							$lte: endOfDay,
						},
					},
				},
				{
					$unwind: "$data_sheet",
				},
				{
					$match: {
						"data_sheet.date": {
							$gte: startOfDay,
							$lte: endOfDay,
						},
					},
				},
				{
					// Add fields to convert "HH:mm" into total minutes
					$addFields: {
						hoursInMinutes: {
							$let: {
								vars: {
									parts: { $split: ["$data_sheet.hours", ":"] }, // Split "HH:mm" into [HH, mm]
								},
								in: {
									$add: [
										{ $multiply: [{ $toInt: { $arrayElemAt: ["$$parts", 0] } }, 60] }, // HH * 60
										{ $toInt: { $arrayElemAt: ["$$parts", 1] } }, // mm
									],
								},
							},
						},
					},
				},
				{
					$group: {
						_id: {
							project_id: "$project_id",
							date: "$data_sheet.date",
						},
						total_minutes: { $sum: "$hoursInMinutes" }, // Sum the minutes
					},
				},
				{
					$group: {
						_id: "$_id.project_id",
						total_minutes: { $sum: "$total_minutes" },
						entries: {
							$push: {
								date: "$_id.date",
								minutes: "$total_minutes",
							},
						},
					},
				},
				{
					// Convert total minutes back to "HH:mm" format
					$addFields: {
						total_hours: {
							$let: {
								vars: {
									hours: { $floor: { $divide: ["$total_minutes", 60] } }, // Get hours
									minutes: { $mod: ["$total_minutes", 60] }, // Get remaining minutes
								},
								in: {
									$concat: [
										{ $toString: "$$hours" },
										":",
										{
											$cond: {
												if: { $gte: ["$$minutes", 10] },
												then: { $toString: "$$minutes" },
												else: { $concat: ["0", { $toString: "$$minutes" }] },
											},
										},
									],
								},
							},
						},
					},
				},
				{
					$lookup: {
						from: "projects",
						localField: "_id",
						foreignField: "_id",
						as: "project",
					},
				},
				{
					$unwind: "$project",
				},
				{
					$project: {
						_id: 1,
						project_id: "$_id",
						project_name: "$project.project_name",
						total_hours: 1,
						entries: {
							$map: {
								input: "$entries",
								as: "entry",
								in: {
									date: "$$entry.date",
									hours: {
										$let: {
											vars: {
												hours: { $floor: { $divide: ["$$entry.minutes", 60] } },
												minutes: { $mod: ["$$entry.minutes", 60] },
											},
											in: {
												$concat: [
													{ $toString: "$$hours" },
													":",
													{
														$cond: {
															if: { $gte: ["$$minutes", 10] },
															then: { $toString: "$$minutes" },
															else: { $concat: ["0", { $toString: "$$minutes" }] },
														},
													},
												],
											},
										},
									},
								},
							},
						},
					},
				},
			]);
	
			return timesheets;
		} catch (error) {
			console.error(error);
			throw new Error(error.message);
	    }
	}
	  
	//get timesheets for a week
	async getWeeklyTimesheets(user_id, startDate, endDate) {
		try {

			const query = {
				user_id,
				$or: [
					{ startDate: { $gte: startDate, $lte: endDate } },
					{ endDate: { $gte: startDate, $lte: endDate } },
					{ startDate: { $lte: startDate }, endDate: { $gte: endDate } }
				]
			};

			const timesheets = await Timesheet.find(query)
				.populate('project_id', 'project_name')
				.populate('task_category_id', 'category')
				.lean()

			return timesheets;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	// FILEPATH: c:/Users/LENOVO/Desktop/MERN(A)/TECHFRIAR/workfriar_backend/src/repositories/admin/timesheet-repository.js

	async checkSavedTimesheetsAroundRange(user_id, startDate, endDate) {
		try {
			// Find saved timesheets before the given range
			const savedBefore = await Timesheet.findOne({
				user_id,
				status: 'saved',
				endDate: { $lt: startDate }
			}).sort({ endDate: -1 }).lean();

			// Find saved timesheets after the given range
			const savedAfter = await Timesheet.findOne({
				user_id,
				status: 'saved',
				startDate: { $gt: endDate }
			}).sort({ startDate: 1 }).lean();

			return {
				isPrev: savedBefore ? true : false,
				isNext: savedAfter ? true : false
			};
		} catch (error) {
			throw new Error(error.message);
		}
	}

	//get timesheet report
	async getTimesheetReport(start, end, projectIds, userIds, page = 1, limit = 10) {
		try {
		  const startDate = new Date(start);
		  const endDate = new Date(end);
		  const skip = (page - 1) * limit;
	  
		  const matchStage = {
			$match: {
			  endDate: { $gte: startDate, $lte: endDate },
			},
		  };
	  
		  if (projectIds && projectIds.length > 0) {
			matchStage.$match.project_id = { $in: projectIds.map((id) => new mongoose.Types.ObjectId(id)) };
		  }
	  
		  if (userIds && userIds.length > 0) {
			matchStage.$match.user_id = { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) };
		  }
	  
		  const aggregationPipeline = [
			matchStage,
			{
			  $unwind: { path: "$data_sheet", preserveNullAndEmptyArrays: true },
			},
			{
			  $addFields: {
				totalHours: {
				  $add: [
					{ $toDouble: { $arrayElemAt: [{ $split: ["$data_sheet.hours", ":"] }, 0] } },
					{ $divide: [{ $toDouble: { $arrayElemAt: [{ $split: ["$data_sheet.hours", ":"] }, 1] } }, 60] },
				  ],
				},
			  },
			},
			{
			  $addFields: {
				totalHours: { $round: ["$totalHours", 0] }, // Round totalHours to whole numbers
			  },
			},
			{
			  $group: {
				_id: { user_id: "$user_id", project_id: "$project_id" },
				loggedHours: { $sum: "$totalHours" },
				approvedHours: {
				  $sum: {
					$cond: [{ $eq: ["$status", "accepted"] }, "$totalHours", 0],
				  },
				},
				timesheets: { $push: "$$ROOT" },
			  },
			},
			{
			  $addFields: {
				loggedHours: { $round: ["$loggedHours", 0] }, // Round loggedHours to whole numbers
				approvedHours: { $round: ["$approvedHours", 0] }, // Round approvedHours to whole numbers
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
				project_name: { $arrayElemAt: ["$projectDetails.project_name", 0] },
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
				projectDetails: 0,
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
					project_name: "$project_name",
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
			  $addFields: {
				totalLoggedHours: { $round: ["$totalLoggedHours", 0] }, // Round totalLoggedHours to whole numbers
				totalApprovedHours: { $round: ["$totalApprovedHours", 0] }, // Round totalApprovedHours to whole numbers
			  },
			},
			{
			  $sort: { _id: 1 },
			},
		  ];
	  
		  const facetStage = {
			$facet: {
			  paginatedResults: [{ $skip: skip }, { $limit: limit }],
			  totalCount: [{ $count: "count" }],
			},
		  };
	  
		  aggregationPipeline.push(facetStage);
	  
		  const result = await Timesheet.aggregate(aggregationPipeline).exec();
	  
		  const paginatedResults = result[0].paginatedResults;
		  const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
	  
		  return {
			report: paginatedResults,
			totalCount: totalCount,
		  };
		} catch (error) {
		  throw new Error(error);
		}
	  }
	  
	//get timesheet snapshot for a month
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

	//delete timesheet by id
	async deleteTimesheet(timesheetId) {
		try {
			const timesheet = await Timesheet.findByIdAndDelete(timesheetId)
			return timesheet
		} catch (error) {
			throw new Error(error);
		}
	}

	//get status of timesheet submitted by user
	async timesheetCount(userId, start) {
		try {
			const startDate = new Date(start);

			const result = await Timesheet.aggregate([
				{
					$match: {
						user_id: new mongoose.Types.ObjectId(userId),
						startDate: { $lt: startDate }
					}
				},
				{
					$facet: {
						groupedCounts: [
							{
								$group: {
									_id: {
										startDate: { $dateToString: { format: "%Y-%m-%d", date: "$startDate" } },
										endDate: { $dateToString: { format: "%Y-%m-%d", date: "$endDate" } }
									},
									totalCount: { $sum: 1 },
									savedCount: {
										$sum: { $cond: [{ $eq: ["$status", "saved"] }, 1, 0] }
									},
									submittedCount: {
										$sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] }
									},
									approvedCount: {
										$sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] }
									},
									rejectedCount: {
										$sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
									}
								}
							},
							{
								$project: {
									_id: 0,
									startDate: "$_id.startDate",
									endDate: "$_id.endDate",
									totalCount: 1,
									savedCount: 1,
									submittedCount: 1,
									approvedCount: 1,
									rejectedCount: 1
								}
							},
							{
								$sort: { startDate: -1, endDate: -1 }
							}
						],
						totalCounts: [
							{
								$group: {
									_id: null,
									totalTimesheets: { $sum: 1 },
									totalSaved: {
										$sum: { $cond: [{ $eq: ["$status", "saved"] }, 1, 0] }
									},
									totalSubmitted: {
										$sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] }
									},
									totalApproved: {
										$sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] }
									},
									totalRejected: {
										$sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
									}
								}
							},
							{
								$project: {
									_id: 0,
									totalTimesheets: 1,
									totalSaved: 1,
									totalSubmitted: 1,
									totalApproved: 1,
									totalRejected: 1
								}
							}
						]
					}
				}
			]);

			const totalCounts = result[0].totalCounts[0] || {
				totalTimesheets: 0,
				totalSaved: 0,
				totalSubmitted: 0,
				totalApproved: 0,
				totalRejected: 0
			};

			return totalCounts;
		} catch (error) {
			throw new Error(error.message);
		}
	}

	/**
	 * Update timesheet status
	 * @param {string} getTimesheetById
	 * @param {string} status
	 * @returns {Promise<Timesheet>}
	 */
	async updateTimesheetStatus(timesheetId, status) {
		try {
			const timesheet = await Timesheet.findByIdAndUpdate(timesheetId, { status: status }, { new: true });
			return { timesheet, status: true };
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * Get week Start and End date from the timesheetId
	 * @param {string} timesheetId
	 * @returns {Promise<Timesheet>}
	 */
	async getWeekStartAndEndDateByTimesheetId(timesheetId) {
		try {
			const timesheet = await Timesheet.findById(timesheetId);
			if (!timesheet) {
				throw new Error('Timesheet not found');
			}
			const startDate = timesheet.startDate;
			const endDate = timesheet.endDate;
			return { startDate, endDate };
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * Update All Timesheet Status By Week Start And End Date
	 * @param {string} startDate
	 * @param {string} endDate
	 * @param {string} status
	 * @returns {Promise<Timesheet>} 
	 */
	async updateAllTimesheetStatus(startDate, endDate, status) {
		try {
			const timesheets = await Timesheet.updateMany({ startDate: { $gte: startDate, $lte: endDate }, status: { $ne: status } }, { status: status });
			return timesheets;
		} catch (error) {
			throw new Error(error);
		}
	}
}

