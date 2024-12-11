import RoleRepository from "../../repositories/admin/role-repository.js"
import ProjectTeamRepository from "../../repositories/admin/project-team-repository.js"
import ProjectRepository from "../../repositories/admin/project-repository.js"
import TimesheetRepository from "../../repositories/admin/timesheet-repository.js"

const projectTeam=new ProjectTeamRepository()
const project=new ProjectRepository()
const timesheetrepo=new TimesheetRepository()

class TimesheetApprovalController 
{
    /**
 * @swagger
 * /admin/getmembers:
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

    async getMembers(req,res)
    {
        try
        {
            const {page=1,limit=10}=req.body
            const pageNumber = parseInt(page,10);
            const limitNumber = parseInt(limit, 10);
            const skip=(pageNumber-1)*limitNumber
            const userId=""//get from Token
            const userRole=await RoleRepository.getRoleByUserId(userId)
            if(userRole.role==="Team Lead")
            {
                const projects=await  project.getProjectsByProjectLead(userId)
                const data = await Promise.all(
                    projects.map(async (item) => {
                        return {
                            projectTeam: await projectTeam.getAllProjectTeamExpandedByProjectId(item._id, skip, limitNumber),
                            project: await project.getProjectById(item._id),
                        };
                    })
                ); 
                return res.status(200).json({
                    status:true,
                    message:"Project Team fetched successfully",
                    data:data
                })
            }
            else if(userRole.role==="Project Manager" || userRole.role==="Technichal Lead")
            {
                const teamLeads=await RoleRepository.getTeamLeads(skip,limitNumber)
                return res.status(200).json({
                    status:true,
                    message:"Team Leads fetched successfully",
                    data:teamLeads
                })
            }
            else
            {
                return res.status(400).json({
                    status:true,
                    message:"No Timesheets for Review",
                    data:[]
                })
            }

        }
        catch(error)
        {
            return res.status(500).json(
                {status:false,
                message:error.message,
                data:[]
            })
        }
    }
/**
 * @swagger
 * /timesheet/managetimesheet:
 *   post:
 *     summary: Updates the status of a timesheet.
 *     tags:
 *       - TimeSheet
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
    async manageTimeSheet(req,res)
    {
        const {timesheetid,state}=req.body
        try
        {
            const {timesheet,status}=await timesheetrepo.updateTimesheetStatus(timesheetid,state)
            if(status)
            {
                return res.status(200).json({
                    status:true,
                    message:"Timesheet Status updated successfully",
                    data:timesheet
                })
            }
            else
            {
                return res.status(400).json({
                    status:true,
                    message:"Timesheet Status not updated",
                    data:data
                })
            }
        }
        catch(error)
        {
            return res.status(500).json(
                {status:false,
                message:error.message,
                data:[]
            })
        }
    }
}
export default TimesheetApprovalController