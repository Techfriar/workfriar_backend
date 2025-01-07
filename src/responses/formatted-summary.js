import moment from "moment";

export default class TimeSummaryResponse {
    // Function for formatting the time sheet summary
    async formattedSummary(timeData) {
        try {
            const userSummary = {};
    
            // Iterate through the timeData
            timeData.forEach((summary) => {
                const userName = summary.user_id.full_name;
                if (!userSummary[userName]) {
                    userSummary[userName] = {
                        team_member: userName,
                        total_time: 0,       
                        approved_time: 0,   
                        submitted_or_rejected_time: 0, 
                    };
                }
    
                // Iterate through the data_sheet
                summary.data_sheet.forEach((sheetData) => {
                    if (sheetData.hours) {
                        const [hours, minutes] = sheetData.hours.split(':').map(Number);
                        const totalMinutes = hours * 60 + minutes;
    
                        // Add to total_time
                        userSummary[userName].total_time += totalMinutes;
    
                        // Add to approved_time if status is "accepted"
                        if (summary.status === "accepted") {
                            userSummary[userName].approved_time += totalMinutes;
                        }
    
                        // Add to submitted_or_rejected_time if status is "submitted" or "rejected"
                        if (summary.status === "submitted" || summary.status === "rejected") {
                            userSummary[userName].submitted_or_rejected_time += totalMinutes;
                        }
                    }
                });
            });
    
            // Helper function to format minutes into HH:MM
            function formatTime(totalMinutes) {
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
    
            // Format all times in userSummary
            for (const user in userSummary) {
                userSummary[user].total_time = formatTime(userSummary[user].total_time);
                userSummary[user].approved_time = formatTime(userSummary[user].approved_time);
                userSummary[user].submitted_or_rejected_time = formatTime(userSummary[user].submitted_or_rejected_time);
            }
    
            // Convert userSummary to an array and return it
            const result = Object.values(userSummary);
            return result;
    
        } catch (error) {
            throw new Error("An error occurred while processing the time data.",error);
        }
    }
    

    // Function for formatting all timesheets that are overdue
  
    async formattedPastDueList(data, status) {
        const accepted = [];
        const rejected = [];
        const saved = [];
    
        data.forEach((week) => {
            const timesheets = week.timesheets;
    
            let finalStatus = "";
    
            if (status === "accepted") {
                const allAccepted = timesheets.every((ts) => ts.status === "accepted");
                if (!allAccepted) return;
                finalStatus = "accepted";
            }
            if (status === "rejected") {
                const hasRejected = timesheets.some((ts) => ts.status === "rejected");
                if (!hasRejected) return;
                finalStatus = "rejected";
            }
            if (status !== "rejected" && status !== "accepted") {
                const allAccepted = timesheets.every((ts) => ts.status === "accepted");
                const hasSaved = timesheets.some((ts) => ts.status === "saved");
    
                if (hasSaved) {
                    finalStatus = "saved";
                } else if (allAccepted) {
                    finalStatus = "accepted";
                } else {
                    return;
                }
            }
            const totalMinutes = timesheets.reduce((weekTotal, ts) => {
                const sheetMinutes = ts.data_sheet.reduce((sheetTotal, entry) => {
                    if (entry.hours) {
                        const [hours, minutes] = entry.hours.split(":").map(Number);
                        return sheetTotal + (hours * 60 + minutes);
                    }
                    return sheetTotal;
                }, 0);
                return weekTotal + sheetMinutes;
            }, 0);
    
            const formatTime = (minutes) => {
                const hours = Math.floor(minutes / 60);
                const remainingMinutes = minutes % 60;
                return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
            };
    
            const totalHours = formatTime(totalMinutes);
    
            let rejectedHours = 0;
            if (finalStatus === "rejected") {
                rejectedHours = timesheets
                    .filter((ts) => ts.status === "rejected")
                    .reduce((rejectTotal, ts) => {
                        const sheetMinutes = ts.data_sheet.reduce((sheetTotal, entry) => {
                            if (entry.hours) {
                                const [hours, minutes] = entry.hours.split(":").map(Number);
                                return sheetTotal + (hours * 60 + minutes);
                            }
                            return sheetTotal;
                        }, 0);
                        return rejectTotal + sheetMinutes;
                    }, 0);
                rejectedHours = formatTime(rejectedHours);
            }
    
            const weekSummary = {
                startDate: week.startDate,
                endDate: week.endDate,
                status: finalStatus,
                totalHours,
                ...(finalStatus === "rejected" ? { rejectedHours } : {}),
            };
    
            // Push the week summary into the corresponding array
            if (finalStatus === "accepted") {
                accepted.push(weekSummary);
               
            } else if (finalStatus === "rejected") {
                rejected.push(weekSummary);
           
            } else if (finalStatus === "saved") {
                saved.push(weekSummary);
            }
        });
        if(status === "accepted") {
            return accepted;
        } else if(status === "rejected") {
            return rejected;
        }
        return saved;
    }
    
    
    //Function for formatting a past due
    async formattedPastDue(data, status) {
        try {
            let overallDailyHours = {}; // Object to store hours grouped by date
    
            // Format each item in the input data
            const result = data.map((item) => {
                const start = moment(item.startDate);
                const end = moment(item.endDate);
    
                // Accumulate daily hours for each entry
                item.data_sheet.forEach((entry) => {
                    console.log(entry)
                    const entryDate = moment(entry.date).format("YYYY-MM-DD");
                    if (!overallDailyHours[entryDate]) {
                        overallDailyHours[entryDate] = 0;
                    }
                        const [hours, minutes] = entry.hours.split(":").map(Number);
                        overallDailyHours[entryDate] += hours * 60 + minutes;
                        
                });

                // Filter out timesheets based on the provided status
                if (status && status !== item.status) {
                    return null;
                }
    
                // Return the formatted timesheet object
                return {
                    timesheet_id: item._id,
                    project_name: item.project_id.project_name,
                    category_name: item.task_category_id.category,
                    task_detail: item.task_detail,
                    username: item.user_id.full_name,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    date: `${start.format("D MMMM")} - ${end.format("D MMMM YYYY")}`,
                    data_sheet: item.data_sheet,
                    status: item.status,
                    total_time: item.data_sheet.reduce((acc, curr) => acc + parseFloat(curr.hours), 0),
                };
            });
    
            // Sort overallDailyHours by date and return as part of the output
            const sortedDailyHours = Object.entries(overallDailyHours)
                .sort(([dateA], [dateB]) => moment(dateA).diff(moment(dateB)))
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});
    
            // Return the array of timesheets as the output
            return result; // `result` is the array of formatted timesheets
        } catch (error) {
            throw new Error(error);
        }
    }
    
}
