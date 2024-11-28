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

	async getCurrentDayTimesheets(userId,startOfDay,endOfDay){
		try {
			//   "data_sheet.date": {
    // $gte: new Date(`${currentDate}T00:00:00.000Z`),
    // $lt: new Date(`${currentDate}T23:59:59.999Z`)
            return await Timesheet.find({user_id: userId,"data_sheet.date": {
				$gte: startOfDay,
				$lte: endOfDay
			}})
        } catch (error) {
            throw new Error(error); 
        }
	}

}

