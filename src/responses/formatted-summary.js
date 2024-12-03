import moment from "moment";
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
            const filteredResult = await result.filter(item => item.approved_time > 0);
            return filteredResult 
        
        } catch (error) {
            throw new Error(error);
        }
        
    }

    async formattedPastDue(data)
    {
        try
        {
            const result=data.map((item)=>{
                return{
                    id:item._id,
                    project_name:item.project_id.project_name,
                    category:item.task_category_id.category,
                    task_detail:item.task_detail,
                    startDate:item.startDate,
                    endDate:item.endDate,
                    date: `${moment(item.startDate).format('D MMMM')} - ${moment(item.endDate).format('D MMMM YYYY')}`
                }
            })
            return result
        }
        catch(error)
        {
            throw new Error(error);
        }
    }
}