import moment from "moment";

export default class TimeSummaryResponse {
    // Function for formatting the time sheet summary
    async formattedSummary(timeData) {
        try {
            console.log("Data", timeData);

            // Create a map to group data by user
            const userSummary = {};

            timeData.forEach((summary) => {
                const userName = summary.user_id.full_name;

                // If user does not exist in the map, initialize their record
                if (!userSummary[userName]) {
                    userSummary[userName] = {
                        team_member: userName,
                        total_time: 0,       // Total time logged for all statuses
                        approved_time: 0,    // Time approved (only for accepted status)
                        submitted_or_rejected_time: 0, // Time for submitted/rejected status
                    };
                }

                // Add hours to respective categories based on status
                summary.data_sheet.forEach((sheetData) => {
                    if (sheetData.hours) {
                        const hours = parseFloat(sheetData.hours);

                        // Add to total time
                        userSummary[userName].total_time += hours;

                        // Add to approved time if status is "accepted"
                        if (summary.status === "accepted") {
                            userSummary[userName].approved_time += hours;
                        }

                        // Add to submitted/rejected time if status is not "accepted"
                        if (summary.status === "submitted" || summary.status === "rejected") {
                            userSummary[userName].submitted_or_rejected_time += hours;
                        }
                    }
                });
            });

            // Convert userSummary map into an array of results
            const result = Object.values(userSummary);

            console.log("Result:", result);
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }

    async formattedPastDue(data) {
        try {
            const result = data.map((item) => {
                return {
                    id: item._id,
                    project_name: item.project_id.project_name,
                    category: item.task_category_id.category,
                    task_detail: item.task_detail,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    date: `${moment(item.startDate).format("D MMMM")} - ${moment(
                        item.endDate
                    ).format("D MMMM YYYY")}`,
                };
            });
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }
}
