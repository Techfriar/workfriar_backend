import Timesheet from "../models/timesheet.js";
class TimeSheetSummary{

    async getTimeSummary(startDate, endDate, projectId) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const timeSummary = await Timesheet.find({
                project_id: projectId,
                startDate: { $gte: start },  
                endDate: { $lte: end }       
            }).populate('user_id', 'full_name') 
              return timeSummary;
        } catch (error) {
            throw new Error(error);
        }
    }
    async getPastDue(userId,weekStartDate) {
        try {
            const pastDue = await Timesheet.find({
                user_id: userId,
                endDate: { $lte: weekStartDate },
                status: "saved"
            }).populate('user_id', 'full_name')
              return pastDue;
        } catch (error) {
            throw new Error(error);
        }
    }
}
export default  TimeSheetSummary