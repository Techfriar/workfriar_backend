import TimeSheetSummary from "../repositories/time-sheet-summary.js";
import TimeSummaryResponse from "../responses/formatted-summary.js";
import FindWeekRange from "../utils/findWeekRange.js";

const timeSheetSummary=new TimeSheetSummary()
const timesummaryResponse=new TimeSummaryResponse()
const findWeekRange=new FindWeekRange()
/**
 * @swagger
 * /admin/timesummary:
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

  /**
 * @swagger
 * /admin/pastdue:
 *   post:
 *     summary: Get due time sheets for a user
 *     description: Retrieves due time sheets for a specific user within a date range
 *     tags:
 *       - TimeSheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *                 example: "6746a63bf79ea71d30770de9"
 *               status:
 *                 type:string
 *                 description:"Status of timesheet"
 *                 example:"accepted" 
 *     responses:
 *       200:
 *         description: Successfully retrieved due time sheets
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
 *                   example: "Due Time Sheet"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       // Define properties of a time sheet here
 *       400:
 *         description: No data available
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
 *         description: Internal Server Error
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


    async pastDueController(req,res)
    {
        const userId="6746a63bf79ea71d30770de7"
        const {status}=req.body
        try
        {
            const {weekStartDate}=await findWeekRange.getWeekRange()
            const data=await timeSheetSummary.getTimeSheet(userId,weekStartDate,status)
            const formattedData= await timesummaryResponse.formattedPastDueList(data,status)
            if(data.length>0)
            {
                res.status(200).json(
                    {
                    status:true,
                    message:"Past Due",
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

/**
 * @swagger
 * /admin/getduetimesheet:
 *   post:
 *     summary: Get due time sheets for a specific user
 *     description: Retrieves due time sheets for a specific user within a given date range.
 *     tags:
 *       - TimeSheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user whose due time sheets are to be retrieved.
 *                 example: "6746a63bf79ea71d30770de9"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the range to search for time sheets (in YYYY-MM-DD format).
 *                 example: "2024-11-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the range to search for time sheets (in YYYY-MM-DD format).
 *                 example: "2024-12-07"
 *               status:
 *                 type:string
 *                 description:"Status of timesheet"
 *                 example:"accepted" 
 *     responses:
 *       200:
 *         description: Successfully retrieved due time sheets for the user.
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
 *                   example: "Due Time Sheet"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         description: The start date of the time sheet range.
 *                         example: "2024-11-01"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         description: The end date of the time sheet range.
 *                         example: "2024-12-07"
 *                       totalHours:
 *                         type: number
 *                         description: Total hours logged in the time sheet range.
 *                         example: 40
 *       400:
 *         description: No due time sheets found for the user within the given date range.
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
 *         description: Internal server error while processing the request.
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

 async getDueTimeSheetController(req,res) {
        const {userId,startDate,endDate,status}=req.body
    try
    {
        const data=await timeSheetSummary.getDueTimeSheet(userId,startDate,endDate,status)
        const formattedData= await timesummaryResponse.formattedPastDue(data)
            if(data)
            {
                res.status(200).json(
                    {
                    status:true,
                    message:"Due Time Sheet",
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