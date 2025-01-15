import RoleRepository from "../../repositories/admin/role-repository.js";
import ProjectTeamRepository from "../../repositories/admin/project-team-repository.js";
import ProjectRepository from "../../repositories/admin/project-repository.js";
import RejectionNotesRepository from "../../repositories/admin/rejection-notes-repository.js";
import TimesheetRepository from "../../repositories/admin/timesheet-repository.js";
import TeamMembersResponse from "../../responses/team-members-reponse.js";
import ManageTimesheetRequest from "../../requests/admin/manage-timesheet-request.js";
import UserRepository from "../../repositories/user-repository.js";
import NotificationController from "../notification-controller.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import CreateTimesheetRequest from "../../requests/admin/timesheet-request.js";
import FindSunday from "../../utils/findSunday.js";
import FindWeekRange from "../../utils/findWeekRange.js";
import HolidayRepository from "../../repositories/admin/holiday-repository.js";
import TimesheetResponse from "../../responses/timesheet-response.js";

const projectTeamrepo = new ProjectTeamRepository();
const projectRepo = new ProjectRepository();
const timesheetrepo = new TimesheetRepository();
const teammemberResponse = new TeamMembersResponse();
const rejectRepo = new RejectionNotesRepository();
const notification = new NotificationController();
const managetimesheetRequest = new ManageTimesheetRequest();
const userRepository = new UserRepository();
const FindWeekRange_ = new FindWeekRange();
const HolidayRepo = new HolidayRepository();
const timesheetResponse = new TimesheetResponse()

class TimesheetApprovalController {
  /**
   * @swagger
   * /admin/approvalcenter:
   *   post:
   *     summary: Get members based on user role
   *     description: Retrieves a list of members based on the user's role. Different roles have access to different sets of members.
   *     tags: [TimeSheet]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               page:
   *                 type: integer
   *                 description: Page number for pagination
   *                 default: 1
   *               limit:
   *                 type: integer
   *                 description: Number of items per page
   *                 default: 10
   *     responses:
   *       200:
   *         description: Successfully retrieved members
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
   *                   example: "Members fetched successfully"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       projectTeam:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             _id:
   *                               type: string
   *                               example: "60d5ecb54b24a1a8c8c3e111"
   *                             name:
   *                               type: string
   *                               example: "John Doe"
   *                             email:
   *                               type: string
   *                               example: "john.doe@example.com"
   *                             role:
   *                               type: string
   *                               example: "Developer"
   *                       project:
   *                         type: object
   *                         properties:
   *                           _id:
   *                             type: string
   *                             example: "60d5ecb54b24a1a8c8c3e222"
   *                           name:
   *                             type: string
   *                             example: "Project Alpha"
   *       400:
   *         description: Bad request or no timesheets for review
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
   *                   example: "No Timesheets for Review"
   *                 data:
   *                   type: array
   *                   items: {}
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
   *                   example: "Internal Server Error"
   *                 data:
   *                   type: array
   *                   items: {}
   */

  async getMembers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.body;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const skip = (pageNumber - 1) * limitNumber;
      let userId = req.session?.user?.id; //get from Token
      const userRole = await RoleRepository.getRoleByUserId(userId);
      if (userRole.role === "Team Lead") {
        const projects = await projectRepo.getProjectsByProjectLead(userId);

        const data = await Promise.all(
          projects.map(async (item) => {
            return {
              projectTeam:
                await projectTeamrepo.getProjectTeamExpandedByProjectId(
                  item._id,
                  skip,
                  limitNumber
                ),
              project: await projectRepo.getProjectById(item._id),
            };
          })
        );
        const formattedData = await teammemberResponse.formatTeammembers(data);
        return res.status(200).json({
          status: true,
          message: "Project Team fetched successfully",
          data: formattedData,
        });
      } else if (
        userRole.role === "Project Manager" ||
        userRole.role === "Technichal Lead"
      ) {
        const teamLeads = await RoleRepository.getTeamLeads(skip, limitNumber);
        const formattedData =
          await teammemberResponse.formatTeamLeads(teamLeads);
        return res.status(200).json({
          status: true,
          message: "Team Leads fetched successfully",
          data: formattedData,
        });
      } else {
        return res.status(400).json({
          status: true,
          message: "No Timesheets for Review",
          data: [],
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ status: false, message: error.message, data: [] });
    }
  }
  /**
   * @swagger
   * /admin/managetimesheet:
   *   post:
   *     summary: Updates the status of a timesheet.
   *     tags: [TimeSheet]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               timesheetid:
   *                 type: string
   *                 description: The ID of the timesheet to be updated.
   *                 example: "12345"
   *               state:
   *                 type: string
   *                 description: The new state of the timesheet.
   *                 example: "approved"
   *     responses:
   *       200:
   *         description: Timesheet status updated successfully.
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
   *                   example: "Timesheet Status updated successfully"
   *                 data:
   *                   type: object
   *                   description: The updated timesheet details.
   *       400:
   *         description: Timesheet status not updated due to a bad request.
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
   *                   example: "Timesheet Status not updated"
   *                 data:
   *                   type: object
   *                   description: Additional error information.
   *       500:
   *         description: Internal server error.
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
   *                 data:
   *                   type: array
   *                   items:
   *                     type: string
   */
  async manageTimeSheet(req, res) {
    let userId = req.session?.user?.id; //id comes from token
    const { timesheetid, state } = req.body;
    try {
      const user = await userRepository.getUserById(userId);
      const { timesheet, status } = await timesheetrepo.updateTimesheetStatus(
        timesheetid,
        state
      );
      if (status) {
        await notification.createNotification(
          timesheet.user_id,
          `Timesheet  has been ${timesheet.status} by ${user.full_name}`,
          "info"
        );
        return res.status(200).json({
          status: true,
          message: "Timesheet Status updated successfully",
          data: timesheet,
        });
      } else {
        return res.status(400).json({
          status: true,
          message: "Timesheet Status not updated",
          data: data,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  /**
   * @swagger
   * /admin/manage-all-timesheet:
   *   post:
   *     summary: Manage timesheet statuses (approve or reject).
   *     description: Updates the status of timesheets for a user within a specific week. Handles approval or rejection and manages any related rejection records.
   *     tags: [TimeSheet]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               timesheetid:
   *                 type: string
   *                 description: The ID of the timesheet to manage.
   *                 example: "63f1e9f9a6a3bca97e8b4567"
   *               status:
   *                 type: string
   *                 enum: [approved, rejected]
   *                 description: The new status for the timesheet.
   *                 example: "approved"
   *               userid:
   *                 type: string
   *                 description: The user ID associated with the timesheet.
   *                 example: "63f1e9f9a6a3bca97e8b1234"
   *               notes:
   *                 type: string
   *                 description: Notes explaining the rejection (required if status is "rejected").
   *                 example: "Timesheet contains incomplete data."
   *     responses:
   *       200:
   *         description: Timesheet status updated successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                   description: Whether the request was successful.
   *                   example: true
   *                 message:
   *                   type: string
   *                   description: Success message.
   *                   example: "Timesheet Status updated successfully"
   *                 data:
   *                   type: array
   *                   items: {}
   *       422:
   *         description: Validation error occurred.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                   description: Whether the request was successful.
   *                   example: false
   *                 message:
   *                   type: string
   *                   description: Validation error message.
   *                   example: "Invalid input: timesheetd is required."
   *                 data:
   *                   type: array
   *                   items: {}
   *       500:
   *         description: Internal server error.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: boolean
   *                   description: Whether the request was successful.
   *                   example: false
   *                 message:
   *                   type: string
   *                   description: Error message.
   *                   example: "Internal server error"
   *                 data:
   *                   type: array
   *                   items: {}
   */

  async manageAllTimesheet(req, res) {

    let adminId =req.session?.user?.id;//id comes from token
    const admin = await userRepository.getUserById(adminId);

    const { timesheetid, status, userid, notes } = req.body;
    try {
      const validatedData = await managetimesheetRequest.validateData(req.body);
      if (!validatedData.isValid) {
        throw new CustomValidationError(validatedData.message);
      }

      const { startDate, endDate } =
        await timesheetrepo.getWeekStartAndEndDateByTimesheetId(timesheetid);

      const alreadyRejected = await rejectRepo.getByWeek(
        startDate,
        endDate,
        userid
      );

      await timesheetrepo.updateAllTimesheetStatus(
        startDate,
        endDate,
        status,
        userid
      );

      if (alreadyRejected && status === "approved") {
        await notification.createNotification(
          userid,
          `Timesheet  has been ${status} by ${admin.full_name}`,
          "info"
        );
        await rejectRepo.delete(alreadyRejected._id);
        return res.status(200).json({
          status: true,
          message: "Timesheet Approved",
          data: [],
        });
      }

      if (status === "rejected") {
        if (alreadyRejected) {
          await rejectRepo.update(alreadyRejected._id, notes);
          return res.status(200).json({
            status: true,
            message: "Timesheet Notes updated successfully",
            data: [],
          });
        } else {
          await rejectRepo.create(userid, notes, startDate, endDate);
          return res.status(200).json({
            status: true,
            message: "Timesheet Status updated successfully",
            data: [],
          });
        }
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res
          .status(422)
          .json({ status: false, message: error.message, data: [] });
      } else {
        return res.status(500).json({
          status: false,
          message: "Internal server error",
          data: [],
        });
      }
    }
  }

  // test

  //get users timesheet for a week
  /**
   * @swagger
   * /admin/get-all-weekly-timesheets-for-review:
   *   post:
   *     summary: Fetch weekly timesheets
   *     description: Fetch weekly timesheets for a user, grouped by week and including daily details and total hours. Accepts either a specified date range or defaults to the current week.
   *     tags:
   *       - Timesheet
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               startDate:
   *                 type: string
   *                 format: date
   *                 example: "2024-12-01"
   *                 description: Start date of the week (optional).
   *               endDate:
   *                 type: string
   *                 format: date
   *                 example: "2024-12-07"
   *                 description: End date of the week (optional).
   *               user_id:
   *                 type: string
   *                 example: "67627ab34035ba33d1877ba3"
   *                 description: User id (optional).
   *     responses:
   *       200:
   *         description: Weekly timesheets fetched successfully.
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
   *                   example: "Weekly timesheets fetched successfully"
   *                 date_range:
   *                   type: string
   *                   example: "2024-12-01-2024-12-07"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       timesheet_id:
   *                         type: string
   *                         example: "67516e4828f913bae93b44d9"
   *                       project_name:
   *                         type: string
   *                         example: "Danti Deals"
   *                       category_name:
   *                         type: string
   *                         example: "UI/UX"
   *                       task_detail:
   *                         type: string
   *                         example: "Worked on this"
   *                       data_sheet:
   *                         type: array
   *                         items:
   *                           type: object
   *                           properties:
   *                             date:
   *                               type: string
   *                               format: date
   *                               example: "2024-12-05T00:00:00.000Z"
   *                             hours:
   *                               type: string
   *                               example: "04:00"
   *                             normalized_date:
   *                               type: string
   *                               example: "2024-12-05"
   *                             day_of_week:
   *                               type: string
   *                               example: "Thu"
   *                             is_holiday:
   *                               type: boolean
   *                               example: false
   *                             is_disable:
   *                               type: boolean
   *                               example: false
   *                       totalHours:
   *                         type: number
   *                         example: 4
   *                       status:
   *                         type: string
   *                         example: "saved"
   *                 weekDates:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       date:
   *                         type: string
   *                         format: date
   *                         example: "2024-12-01T00:00:00.000Z"
   *                       normalized_date:
   *                         type: string
   *                         example: "2024-12-01"
   *                       day_of_week:
   *                         type: string
   *                         example: "Sun"
   *                       is_holiday:
   *                         type: boolean
   *                         example: false
   *                       is_disable:
   *                         type: boolean
   *                         example: false
   *       422:
   *         description: Validation error.
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
   *                   example: "Validation error"
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: string
   *       500:
   *         description: Internal server error.
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
   *                   example: "An error occurred while fetching timesheets."
   *                 data:
   *                   type: array
   *                   items: {}
   */
  async getAllWeeklyTimesheetsForReview(req, res) {
    
    try {
      let { startDate, endDate, user_id } = req.body;
      let user_location;
  
      if (!user_id) {
        user_id = req.session.user.id;
        user_location = req.session.user.location;
      } else {
        const user = await userRepository.getUserById(user_id);
        user_location = user.location;
      }
      console.log(user_id);

      let actualStartWeek, actualEndWeek;
      if (startDate && endDate) {
        const validatedDates = await CreateTimesheetRequest.validateDateRange(
          startDate,
          endDate
        );
        if (validatedDates.error) {
          throw new CustomValidationError(validatedDates.error);
        }

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        // Find actual start and end of the week
        actualStartWeek = FindSunday.getPreviousSunday(startDate);
        actualEndWeek = new Date(actualStartWeek);
        actualEndWeek.setDate(actualStartWeek.getDate() + 6);
      } else {
        const timezone = await findTimezone(req);
        let today = getLocalDateStringForTimezone(timezone, new Date());

        if (typeof today === "string") {
          today = new Date(today);
        }

        actualStartWeek = FindSunday.getPreviousSunday(today);
        actualEndWeek = new Date(actualStartWeek);
        actualEndWeek.setDate(actualStartWeek.getDate() + 6);

        startDate = FindWeekRange_.getWeekStartDate(today);
        startDate.setUTCHours(0, 0, 0, 0);
        endDate = FindWeekRange_.getWeekEndDate(today);
      }

      endDate.setUTCHours(0, 0, 0, 0);
      let range = `${startDate.toISOString().split("T")[0]}-${endDate.toISOString().split("T")[0]}`;

      const timesheets = await timesheetrepo.getWeeklyTimesheetsWithSpecificStatus(
        user_id,
        startDate,
        endDate,
        "submitted"
      );

      let allDates = FindWeekRange_.getDatesBetween(
        actualStartWeek,
        actualEndWeek
      );

      const weekDates = await Promise.all(
        allDates.map(async (date) => {
          let dateString = date.toISOString().split("T")[0];
          let holiday = await HolidayRepo.isHoliday(date, user_location);
          return {
            date: date,
            normalized_date: dateString,
            day_of_week: date.toLocaleDateString("en-US", { weekday: "short" }),
            is_holiday: holiday,
            is_disable: !(
              dateString >= startDate.toISOString().split("T")[0] &&
              dateString <= endDate.toISOString().split("T")[0]
            ),
          };
        })
      );

      if (timesheets.length > 0) {
        const modifydata = timesheets.map((item) => {
          let total_hours = 0;

          const existingDataMap = new Map(
            item.data_sheet.map((data) => [
              new Date(data.date).toISOString().split("T")[0],
              data,
            ])
          );

          // Process all dates for the week
          item.data_sheet = allDates.map((date) => {
            const dateString = date.toISOString().split("T")[0];
            const existingData = existingDataMap.get(dateString);
            if (existingData) {
              total_hours += parseFloat(existingData.hours);
              existingData.normalized_date = dateString;
              existingData.day_of_week = date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              existingData.is_disable = !(
                dateString >= startDate.toISOString().split("T")[0] &&
                dateString <= endDate.toISOString().split("T")[0]
              );
              return existingData;
            } else {
              return {
                date: date,
                hours: "00:00",
                normalized_date: dateString,
                day_of_week: date.toLocaleDateString("en-US", {
                  weekday: "short",
                }),
                is_holiday: false,
                is_disable: !(
                  dateString >= startDate.toISOString().split("T")[0] &&
                  dateString <= endDate.toISOString().split("T")[0]
                ),
              };
            }
          });

          item.totalHours = total_hours;
          return item;
        });

        let data = await Promise.all(
          modifydata.map(
            async (item) =>
              await timesheetResponse.weeklyTimesheetResponse(item)
          )
        );

        data.date_range = range;

        res.status(200).json({
          status: true,
          message: "Weekly timesheets fetched successfully",
          date_range: range,
          data: data,
          weekDates,
        });
      } else {
        return res.status(200).json({
          status: false,
          message: "No timesheets found for the provided date range",
          date_range: range,
          data: [],
          weekDates,
        });
      }
    } catch (err) {
      console.error("This is the error:",err)
      if (err instanceof CustomValidationError) {
        res.status(422).json({
          status: false,
          message: "Validation error",
          errors: err.errors,
        });
      } else {
        return res.status(500).json({
          status: false,
          message: err.message,
          data: [],
        });
      }
    }
  }
}
export default TimesheetApprovalController;
