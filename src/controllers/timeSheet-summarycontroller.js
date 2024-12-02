import TimeSheetSummary from "../repositories/time-sheet-summary.js";
import TimeSummaryResponse from "../responses/formatted-summary.js";

const timeSheetSummary=new TimeSheetSummary()
const timesummaryResponse=new TimeSummaryResponse()
class TimeSheetSummaryController{
    async TimeSummaryController(req,res)
    {
        const{startDate,endDate,projectId,userId}=req.body
        try
        {
            const data=await timeSheetSummary.getTimeSummary(startDate,endDate,projectId)
            if(data.length>0)
            {
            const formattedData= await timesummaryResponse.formattedSummary(data)
                res.status(200).json(
                    {
                    status:true,
                    message:"Time Summmary",
                    data:formattedData
                    })
            }
            else
            {
                res.status(400).json(
                    {
                    status:false,
                    message:"No Data",
                    data:[]
                    })
            }
            
        }
        catch(error)
        {
            res.status(500).json(
                {
                    status:false,
                    message:"Internal Server Error",
                    data:[],
                })
        }
    }
}
export default TimeSheetSummaryController