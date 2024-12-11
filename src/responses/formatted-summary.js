import moment from "moment";

export default class TimeSummaryResponse {
    // Function for formatting the time sheet summary
    async formattedSummary(timeData) {
        try {
            const userSummary = {};
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
                summary.data_sheet.forEach((sheetData) => {
                    if (sheetData.hours) {
                        const hours = parseFloat(sheetData.hours);
                        userSummary[userName].total_time += hours;
                        if (summary.status === "accepted") {
                            userSummary[userName].approved_time += hours;
                        }
                        if (summary.status === "submitted" || summary.status === "rejected") {
                            userSummary[userName].submitted_or_rejected_time += hours;
                        }
                    }
                });
            });
            const result = Object.values(userSummary);
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }

    // Function for formatting all timesheets that are overdue
  
    async formattedPastDueList(data, status) {
        return data.map((week) => {
            const timesheets = week.timesheets;
            
            // If status is "accepted", we need to check if all timesheets are accepted
            if (status === "accepted") {
                const allAccepted = timesheets.every((ts) => ts.status === "accepted");
    
                // If not all timesheets are accepted, return null to exclude this week
                if (!allAccepted) {
                    return null;
                }
            }
    
            let finalStatus = "";
    
            if (status === "rejected") {
                const hasRejected = timesheets.some((ts) => ts.status === "rejected");
    
                if (hasRejected) {
                    finalStatus = "rejected";
                } else {
                    return null; 
                }
            }
    
            const allAccepted = timesheets.every((ts) => ts.status === "accepted");
            const hasSaved = timesheets.some((ts) => ts.status === "saved");
            
            if (status !== "rejected") {
                if (hasSaved) {
                    finalStatus = "saved"; 
                } else if (allAccepted) {
                    finalStatus = "accepted"; 
                }
            }
            const totalHours = timesheets.reduce((weekTotal, ts) => {
                const sheetHours = ts.data_sheet.reduce(
                    (sheetTotal, entry) => sheetTotal + parseFloat(entry.hours),
                    0
                );
                return weekTotal + sheetHours;
            }, 0);
    
            let rejectedHours = 0;
            if (finalStatus === "rejected") {
                rejectedHours = timesheets
                    .filter((ts) => ts.status === "rejected")
                    .reduce((rejectTotal, ts) => {
                        const sheetHours = ts.data_sheet.reduce(
                            (sheetTotal, entry) => sheetTotal + parseFloat(entry.hours),
                            0
                        );
                        return rejectTotal + sheetHours;
                    }, 0);
            }
            return {
                startDate: week.startDate,
                endDate: week.endDate,
                status: finalStatus,
                totalHours,
                ...(finalStatus === "rejected" ? { rejectedHours } : {}), 
            };
        }).filter((week) => week !== null); 
    }

    
    //Function for formatting a past due
    async formattedPastDue(data) {
        try {
            let overallDailyHours = {};
            const result = data.map((item) => {
                const start = moment(item.startDate);
                const end = moment(item.endDate);
                item.data_sheet.forEach((entry) => {
                    const entryDate = moment(entry.date).format('YYYY-MM-DD');
                    if (!overallDailyHours[entryDate]) {
                        overallDailyHours[entryDate] = 0;
                    }
                    overallDailyHours[entryDate] += parseFloat(entry.hours);
                });
                return {
                    id: item._id,
                    project_name: item.project_id.project_name,
                    category: item.task_category_id.category,
                    task_detail: item.task_detail,
                    username: item.user_id.full_name,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    date: `${start.format("D MMMM")} - ${end.format("D MMMM YYYY")}`,
                    dataSheet: item.data_sheet,
                    status: item.status,
                    total_time: item.data_sheet.reduce((acc, curr) => acc + parseFloat(curr.hours), 0),
                };
            });
            const sortedDailyHours = Object.entries(overallDailyHours)
                .sort(([dateA], [dateB]) => moment(dateA).diff(moment(dateB)))
                .reduce((obj, [key, value]) => {
                    obj[key] = value;
                    return obj;
                }, {});
    
            return {
                timesheets: result,
                daily_hours: sortedDailyHours
            };
        } catch (error) {
            throw new Error(error);
        }
    }    
}
