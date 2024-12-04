import mongoose from "mongoose";
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
            }).populate({path:'project_id',select:'project_name'}).populate({path:'task_category_id',select:'category'})
              return pastDue;
        } catch (error) {
            throw new Error(error);
        }
    }
    async getDueTimeSheet(userId, startDate, endDate) {
        try {
            console.log(userId,startDate,endDate)
            const userObjectId =new mongoose.Types.ObjectId(userId); 
            const start = new Date(startDate); 
            const end = new Date(endDate);
            const dueTimeSheets = await Timesheet.find({
                user_id: userObjectId, 
                startDate: { $gte: start }, 
                endDate: { $lte: end },
                status: "saved" 
            })
                .populate({ path: "project_id", select: "project_name" })
                .populate({ path: "task_category_id", select: "category" }); 
    
            return dueTimeSheets;
        } catch (error) {
            console.error("Error fetching due timesheets:", error.message);
            throw new Error(error.message);
        }
    }
    
}
export default  TimeSheetSummary