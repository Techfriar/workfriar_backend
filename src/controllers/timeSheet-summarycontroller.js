import TimeSheetSummary from "../repositories/time-sheet-summary.js";
import TimeSummaryResponse from "../responses/formatted-summary.js";
import FindWeekRange from "../services/findWeekRange.js";

const timeSheetSummary=new TimeSheetSummary()
const timesummaryResponse=new TimeSummaryResponse()
const findWeekRange=new FindWeekRange()
/**
 * @swagger
 * /timesheet:
 *   post:
 *     summary: Fetch and format the time sheet summary.
 *     description: Returns a formatted time sheet summary based on the provided start date, end date, and project ID.
 *     tags:
 *       - TimeSheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-01"
 *                 description: The start date for the summary.
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-31"
 *                 description: The end date for the summary.
 *               projectId:
 *                 type: string
 *                 example: "12345"
 *                 description: The ID of the project to fetch the summary for.
 *     responses:
 *       200:
 *         description: Successfully fetched and formatted the time sheet summary.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Time Summary"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team_member:
 *                         type: string
 *                         example: "John Doe"
 *                       total_time:
 *                         type: number
 *                         format: float
 *                         example: 40.5
 *                       approved_time:
 *                         type: number
 *                         format: float
 *                         example: 30.5
 *       400:
 *         description: No data available for the given parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No Data"
 *                 data:
 *                   type: array
 *                   items: {}
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 *                 data:
 *                   type: array
 *                   items: {}
 */
class TimeSheetSummaryController{
    async TimeSummaryController(req,res)
    {
        const{startDate,endDate,projectId}=req.body
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

    async pastDueController(req,res)
    {
        const userId=req.userId
        try
        {
            const {weekStartDate}=await findWeekRange.getWeekRange()
            console.log("date",weekStartDate)
            const data=await timeSheetSummary.getPastDue(userId,weekStartDate)
            if(data.length>0)
            {
                res.status(200).json(
                    {
                    status:true,
                    message:"Past Due",
                    data:data
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