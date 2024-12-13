import mongoose from "mongoose";
import Timesheet from "../models/timesheet.js";
class TimeSheetSummary{
    //function for retrieveing time logged and appoved time for every members in the project
    async getTimeSummary(startDate, endDate, projectId,skip,limit) {
        try {
            const total=await Timesheet.countDocuments({
                project_id: projectId,
                startDate: { $gte: startDate },
                endDate: { $lte: endDate },
            });

            const start = new Date(startDate);
            const end = new Date(endDate);
            const timeSummary = await Timesheet.find({
                project_id: projectId,
                startDate: { $eq: start },  
                endDate: { $eq: end },     
            }).populate('user_id', 'full_name').skip(skip).limit(limit).sort({createdAt:-1}); 
            return {total,timeSummary};
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    //Function for retrieveing past due timesheets
    async getTimeSheet(userId, weekStartDate,status,skip,limitNumber) {
        try {
            const record=await Timesheet.find({
                user_id: userId,
                status:status,
                endDate: { $lt: new Date(weekStartDate) }})

                const dataCount=record.length

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
            ])
            return {data,dataCount}
        } catch (error) {

            throw new Error(error);
        }
    }
    

    //function for retrieveing timesheets in a period of time
    async getDueTimeSheet(userId, startDate, endDate) {
        try {
            const userObjectId =new mongoose.Types.ObjectId(userId); 
            const start = new Date(startDate); 
            const end = new Date(endDate);
            const dueTimeSheets = await Timesheet.find({
                user_id: userObjectId, 
                startDate: { $gte: start }, 
                endDate: { $lte: end }
            })
                .populate({ path: "project_id", select: "project_name" })
                .populate({ path: "user_id", select: "full_name"})
                .populate({ path: "task_category_id", select: "category" }); 
    
            return dueTimeSheets;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getSpecifiedDates(date)
    {
        try { 
            const timesheetDateRanges = await Timesheet.aggregate([
                { $match: { status: "saved", endDate: { $lt: date } } }, 
                {
                    $group: {
                        _id: null,
                        uniqueRanges: { $addToSet: { start_date: "$startDate", end_date: "$endDate" } }
                    }
                },
                { $unwind: "$uniqueRanges" }, 
                {
                    $project: {
                        _id: 0,
                        start_date: "$uniqueRanges.start_date",
                        end_date: "$uniqueRanges.end_date"
                    }
                }
            ]);
            return timesheetDateRanges;
        } 
        catch(error)
        {
            throw new Error(error)
        }
    }

    
}
export default  TimeSheetSummary