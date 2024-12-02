export default class TimeSummaryResponse{
    //Function for formatting the time sheet summary
    async formattedSummary(timeData) {
        try {
            const result = timeData.map((summary) => {
                const totalTime = summary.data_sheet.reduce((acc, sheetData) => {
                    if (sheetData.hours) {
                        return acc + parseFloat(sheetData.hours);
                    }
                    return acc;
                }, 0);
                const approvedTime = summary.status === "accepted"
                    ? summary.data_sheet.reduce((acc, sheetData) => {
                        if (sheetData.hours) {
                            return acc + parseFloat(sheetData.hours);  
                        }
                        return acc;
                    }, 0)
                    : 0;
        
                return {
                    team_member: summary.user_id.full_name,
                    total_time: totalTime,
                    approved_time: approvedTime,
                };
            });
            const filteredResult = result.filter(item => item.approved_time > 0);
            return filteredResult 
        
        } catch (error) {
            throw new Error(error);
        }
        
    }
}