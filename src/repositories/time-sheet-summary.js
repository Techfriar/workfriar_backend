import mongoose from "mongoose";
import Timesheet from "../models/timesheet.js";
class TimeSheetSummary{
    //function for retrieveing time logged and appoved time for every members in the project
    async getTimeSummary(startDate, endDate, projectId) {
        try {
            console.log(startDate, endDate, projectId);
            const start = new Date(startDate);
            const end = new Date(endDate);
            const timeSummary = await Timesheet.find({
                project_id: projectId,
                startDate: { $eq: start },  
                endDate: { $eq: end },     
            }).populate('user_id', 'full_name'); 

            console.log(timeSummary);
            return timeSummary;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    //Function for retrieveing past due timesheets
    async getTimeSheet(userId, weekStartDate) {
        try {
            const data = await Timesheet.aggregate([
                {
                    $match: {
                        user_id: new mongoose.Types.ObjectId(userId), 
                        endDate: { $lt: new Date(weekStartDate) } 
                    }
                },
                {
                    $group: {
                        _id: {
                            startDate: "$startDate", 
                            endDate: "$endDate"
                        },
                        timesheets: { $push: "$$ROOT" } 
                    }
                },
                {
                    $project: {
                        _id: 0, 
                        startDate: "$_id.startDate", 
                        endDate: "$_id.endDate",     
                        timesheets: 1               
                    }
                }
            ]);
            return data;
        } catch (error) {
            console.error("Error fetching grouped timesheets:", error);
            throw error;
        }
    }
    

    //function for retrieveing timesheets in a period of time
    async getDueTimeSheet(userId, startDate, endDate) {
        try {
            console.log(userId,startDate,endDate)
            const userObjectId =new mongoose.Types.ObjectId(userId); 
            const start = new Date(startDate); 
            const end = new Date(endDate);
            const dueTimeSheets = await Timesheet.find({
                user_id: userObjectId, 
                startDate: { $gte: start }, 
                endDate: { $lte: end }
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