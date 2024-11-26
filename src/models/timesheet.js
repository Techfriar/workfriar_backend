const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TimesheetSchema = new Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskCategory', required: true },
  task_detail: { type: String, required: true },
  data_sheet: [{
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isHoliday: { type: Boolean, required: true },
    hours: { type: String, required: true },
  }],
  status: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Timesheet', TimesheetSchema);
