import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TimesheetSchema = new Schema({
	project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	task_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
	task_detail: { type: String, required: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	data_sheet: [{
		date: {type: Date, required: true},
		isHoliday: { type: Boolean, required: true },
		hours: { type: String, required: true },
	}],
	status: { 
		type: String, 
		required: true,
		enum: ["in_progress", "saved", "submitted", "accepted", "rejected"]
	}
}, { timestamps: true });

// Custom validation to ensure unique dates in data_sheet
TimesheetSchema.path('data_sheet').validate(function(value) {
	const dates = value.map(entry => entry.date.toISOString());
	const uniqueDates = [...new Set(dates)];
	return dates.length === uniqueDates.length;
}, 'Each date in data_sheet must be unique.');

const Timesheet = mongoose.model('Timesheet', TimesheetSchema);

export default Timesheet;
