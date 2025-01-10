import TimeSheetSummary from "../repositories/time-sheet-summary.js";
import TimeSummaryResponse from "../responses/formatted-summary.js";
import FormattedDates from "../responses/format-dates.js";
import generateWeekDateRanges from "../utils/find-week-range.js";
import FindWeekRange from "../utils/findWeekRange.js";
import RejectionNotesRepository from "../repositories/admin/rejection-notes-repository.js";
import HolidayRepository from "../repositories/admin/holiday-repository.js";
import FindSunday from "../utils/findSunday.js";
import findTimezone from "../utils/findTimeZone.js";
import { getDateRangeAroundInput } from "../utils/find-weeks.js";

const timeSheetSummary=new TimeSheetSummary()
const timesummaryResponse=new TimeSummaryResponse()
const rejectRepo=new RejectionNotesRepository()
const findWeekRange=new FindWeekRange()
const formatDates=new FormattedDates()
const FindWeekRange_=new FindWeekRange()
const HolidayRepo = new HolidayRepository()
/**
 * @swagger
 * /timesheet/timesummary:
 *   post:
 *     summary: Fetch and format the time sheet summary.
 *     description: Returns a formatted time sheet summary based on the provided start date, end date, project ID, and optional pagination parameters.
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
 *                 description: The start date for the summary. If not provided, the current week's start date will be used.
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-31"
 *                 description: The end date for the summary. If not provided, the current week's end date will be used.
 *               projectId:
 *                 type: string
 *                 example: "6746a63bf79ea71d30770de7"
 *                 description: The ID of the project to fetch the summary for.
 *               page:
 *                 type: integer
 *                 example: 1
 *                 description: The page number for pagination. Defaults to 1.
 *               limit:
 *                 type: integer
 *                 example: 10
 *                 description: The number of items per page. Defaults to 10.
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
 *                         description: The name of the team member.
 *                       total_time:
 *                         type: number
 *                         format: float
 *                         example: 40.5
 *                         description: The total time logged by the team member in hours.
 *                       approved_time:
 *                         type: number
 *                         format: float
 *                         example: 30.5
 *                         description: The total approved time in hours.
 *                       submitted_or_rejected_time:
 *                         type: number
 *                         format: float
 *                         example: 30.5
 *                         description: The total rejected or submitted time in hours.
 *                 dateRange:
 *                   type: string
 *                   example: "2023-12-01 - 2023-12-31"
 *                   description: The date range for the summary.
 *                 totalPages:
 *                   type: integer
 *                   example: 7
 *                   description: The total number of pages based on the limit.
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
        let {startDate,endDate,projectId,page=1,limit=10}=req.body
        const pageNumber = parseInt(page,10);
        const limitNumber = parseInt(limit, 10);
        const skip=(pageNumber-1)*limitNumber

        if(startDate && endDate)
        {
        startDate=new Date(startDate)
        endDate=new Date(endDate)
        }
        else
        {
            const timezone = await findTimezone(req);
				let today = getLocalDateStringForTimezone(timezone, new Date());
        
				if (typeof today === "string") {
					today = new Date(today);
				}
				startDate = findWeekRange.getWeekStartDate(today);
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
                res.status(200).json(
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
 * /timesheet/pastdue:
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
        let userId= req.session?.user?.id?req.session.user.id:""
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
                res.status(200).json(
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
 * /timesheet/getduetimesheet:
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
 *               passedUserid:
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
 *                       
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
       let userId= req.session?.user?.id?req.session.user.id:""

        let {passedUserid,startDate,endDate,status}=req.body
        try
        {
        const user_location = 'India';
        if(startDate && endDate)
            {
            startDate=new Date(startDate)
            endDate=new Date(endDate)
            }
            else
            {
                const timezone = await findTimezone(req);
                    let today = getLocalDateStringForTimezone(timezone, new Date());
    
                    if (typeof today === "string") {
                        today = new Date(today);
                    }
                    startDate = findWeekRange.getWeekStartDate(today);
                    endDate = findWeekRange.getWeekEndDate(today);
            }
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(0, 0, 0, 0);
            let range = `${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}`;
        if(passedUserid) userId = passedUserid


        let actualStartWeek, actualEndWeek;
				actualStartWeek = FindSunday.getPreviousSunday(startDate);
				actualEndWeek = new Date(actualStartWeek);
				actualEndWeek.setDate(actualStartWeek.getDate() + 6);
			let allDates = FindWeekRange_.getDatesBetween(actualStartWeek, actualEndWeek);

			const weekDates = await Promise.all(
				allDates.map(async (date) => {
					let dateString = date.toISOString().split('T')[0];
					let holiday = await HolidayRepo.isHoliday(date, user_location);
					return {
						date: date,
						normalized_date: dateString,
						day_of_week: date.toLocaleDateString('en-US', { weekday: 'short' }),
						is_holiday: holiday,
						is_disable: !(dateString >= startDate.toISOString().split('T')[0] && dateString <= endDate.toISOString().split('T')[0]),
					};
				})
			);
    let notes
        const data=await timeSheetSummary.getDueTimeSheet(userId,startDate,endDate,status)
        if(status==="rejected")
        {
             notes=await rejectRepo.getByWeek(startDate,endDate,userId)
        }
        const formattedData= await timesummaryResponse.formattedPastDue(data, status)

        
            if(data)
            {
                res.status(200).json(
                    {
                    status:true,
                    message:"Time Sheet Data",
                    data:formattedData,
                    range:range,
                    weekDates:weekDates,
                    notes:notes
                    })
            }
            else
            {
                res.status(200).json(
                    {
                    status:false,
                    message:"No Data",
                    weekDates:weekDates,
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
 * /timesheet/getduedates:
 *   post:
 *     summary: Fetches specified dates based on the week start date.
 *     description: Returns data for the specified week start date. If no data is found, it returns an appropriate response. 
 *     tags:
 *       - TimeSheet
 *     responses:
 *       200:
 *         description: Successfully fetched the data.
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
 *                   example: Data Fetched
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Details about the fetched data.
 *       404:
 *         description: No data found for the specified week start date.
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
 *                   example: No Data
 *                 data:
 *                   type: array
 *                   example: []
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
 *                   example: Internal Server Error
 *                 data:
 *                   type: array
 *                   example: []
 */

   async getDatesController(req,res)
   {
        try{
            const userid=req.session.user.id
            const data=await timeSheetSummary.getSpecifiedDates(userid)
            const formattedDates=await formatDates.formattedDateResponse(data)
            if(data.length>0)
            {
               return res.status(200).json(
                    {
                    status:true,
                    message:"Data Fetched",
                    data:formattedDates,
                    })
            }
            else
            {
               return res.status(200).json(
                    {
                    status:false,
                    message:"No Data",
                    data:[]
                    })
            }

            
        }
        catch(error)
        {
           return res.status(500).json(
                {
                    status:false,
                    message:"Internal Server Error",
                    data:[],
                })
        }
   }
/**
 * @swagger
 * /timesheet/getdates:
 *   post:
 *     summary: Retrieves the date ranges around a specific input date.
 *     description: This endpoint returns the date ranges around a specific input date, including the weeks before and after, based on the logic in the getDateRangeAroundInput function.
 *     tags:
 *       - TimeSheet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-11-10"
 *                 description: The date around which the ranges are calculated.
 *     responses:
 *       200:
 *         description: Successfully retrieved the date ranges around the input date.
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
 *                   example: "Data Fetched"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-11-03"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-11-09"
 *                       label:
 *                         type: string
 *                         example: "Nov 3-Nov 9, 2024"
 *                       month:
 *                         type: string
 *                         example: "November"
 *                       week:
 *                         type: integer
 *                         example: 0
 *       500:
 *         description: Internal server error
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
 *                   example: "Internal server error"
 */

   async getAllDatesController(req,res)
   {
    try
    {
        const {date}=req.body
        const data=await generateWeekDateRanges()
        const result=await getDateRangeAroundInput(date,10,data)
        const formattedDates = await formatDates.formattedDateResponse(result);
     res.status(200).json(
        {
        status:true,
        message:"Data Fetched",
        data:formattedDates,
        })
    }
    catch(error)
    {
       
        res.status(500).json(
            {
                status:false,
                message:"Internal server error",
                data:[],
            })
    }
   }
    
}
export default TimeSheetSummaryController