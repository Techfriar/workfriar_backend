import TimeSheetSummary from "../repositories/time-sheet-summary.js";
import TimeSummaryResponse from "../responses/formatted-summary.js";
import findTimezone from "../utils/findTimeZone.js";
import FindWeekRange from "../utils/findWeekRange.js";
import RejectionNotesRepository from "../repositories/admin/rejection-notes-repository.js";

const timeSheetSummary=new TimeSheetSummary()
const timesummaryResponse=new TimeSummaryResponse()
const rejectRepo=new RejectionNotesRepository()
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
 *                 example: "6746a63bf79ea71d30770de7"
 *                 description: The ID of the project to fetch the summary for.
 *               page:
 *                 type: integer
 *                 example: 3
 *               limit:
 *                 type: integer
 *                 example: 10
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
 *                       totalPages:
 *                         type:number
 *                         format:int
 *                         example:7
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
        try
        {
        let {startDate,endDate,projectId,page=1,limit=10,prev,next}=req.body
        const pageNumber = parseInt(page,10);
        const limitNumber = parseInt(limit, 10);
        const skip=(pageNumber-1)*limitNumber

        if(startDate && endDate)
        {
        const adjustDates=findWeekRange.adjustWeekRange(startDate,endDate,prev,next)
        startDate=new Date(adjustDates.startDate)
        endDate=new Date(adjustDates.endDate)
        }
        else
        {
            const timezone = await findTimezone(req);
				let today = getLocalDateStringForTimezone(timezone, new Date());

				if (typeof today === "string") {
					today = new Date(today);
				}
				startDate = findWeekRange.getWeekStartDate(today);
				startDate.setUTCHours(0, 0, 0, 0);
				endDate = findWeekRange.getWeekEndDate(today);
        }
        startDate.setUTCHours(0, 0, 0, 0);
        endDate.setUTCHours(0, 0, 0, 0);
        let range = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`;
            const data=await timeSheetSummary.getTimeSummary(startDate,endDate,projectId,skip,limitNumber)
            if(data.timeSummary.length>0)
            {
               
            const formattedData= await timesummaryResponse.formattedSummary(data.timeSummary)
                res.status(200).json(
                    {
                    status:true,
                    message:"Time Summmary",
                    data:formattedData,
                    dateRange:range,
                    totalPages: Math.ceil(data.total/limitNumber)
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
            console.log(error)
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
 *             required:
 *               - userId
 *               - status
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *                 example: "6746a63bf79ea71d30770de9"
 *               status:
 *                 type:string
 *                 description:"Status of timesheet"
 *                 example:"accepted" 
 *               passedUserid:
 *                 type:string
 *                 description:userid passed from body'
 *                 example:"6746a63bf79ea71d30770de9"   
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
 *                 totalPages: 
 *                   type:number
 *                   example:2
 *                   
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
        let userId="6746a63bf79ea71d30770de7"
        let {status,passedUserid,page=1,limit=10}=req.body
        const pageNumber = parseInt(page,10);
        const limitNumber = parseInt(limit, 10);
        const skip=(pageNumber-1)*limitNumber
        if(passedUserid) userId = passedUserid
        try
        {
            const {weekStartDate}=await findWeekRange.getWeekRange()
            const {data,dataCount}=await timeSheetSummary.getTimeSheet(userId,weekStartDate,status,skip,limitNumber)
            const formattedData= await timesummaryResponse.formattedPastDueList(data,status)
            if(data.length>0)
            {
                res.status(200).json(
                    {
                    status:true,
                    message:"Data Fetched",
                    data:formattedData,
                    totalPages: Math.ceil(dataCount/limitNumber)
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
    let userId="6746a63bf79ea71d30770de7"
        let {passedUserid,startDate,endDate,status,prev,next}=req.body
        if(startDate && endDate)
            {
            const adjustDates=findWeekRange.adjustWeekRange(startDate,endDate,prev,next)
            startDate=new Date(adjustDates.startDate)
            endDate=new Date(adjustDates.endDate)
            }
            else
            {
                const timezone = await findTimezone(req);
                    let today = getLocalDateStringForTimezone(timezone, new Date());
    
                    if (typeof today === "string") {
                        today = new Date(today);
                    }
                    startDate = findWeekRange.getWeekStartDate(today);
                    startDate.setUTCHours(0, 0, 0, 0);
                    endDate = findWeekRange.getWeekEndDate(today);
            }
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(0, 0, 0, 0);
            let range = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`;
        if(passedUserid) userId = passedUserid
    try
    {
        let notes
        const data=await timeSheetSummary.getDueTimeSheet(userId,startDate,endDate,status)
        if(status==="rejected")
        {
             notes=await rejectRepo.getByWeek(startDate,endDate,userId)
        }
        const formattedData= await timesummaryResponse.formattedPastDue(data)

            if(data)
            {
                res.status(200).json(
                    {
                    status:true,
                    message:"Time Sheet Data",
                    data:formattedData,
                    range:range,
                    notes:notes?notes:""
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