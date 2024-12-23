import ProjectTeamRepository from "../repositories/admin/project-team-repository.js";
import ProjectTeamResponse from "../responses/projectteam-response.js";
import ProjectTeamRequest from "../requests/admin/project-team-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";
import ProjectRepository from "../repositories/admin/project-repository.js";
import findTimeZone from "../utils/findTimeZone.js";
import getLocalDateStringForTimezone from "../utils/getLocalDateStringForTimezone.js"


const projectTeamRepo=new ProjectTeamRepository()
const projectTeamResponse=new ProjectTeamResponse()
const projectTeamRequest=new ProjectTeamRequest()
const projectRepo=new ProjectRepository()

class ProjectTeamController{

  /**
 * @swagger
 * /admin/addprojectteam:
 *   post:
 *     summary: Create a new project team
 *     tags: [ProjectTeams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 description: ID of the project to which the team belongs
 *                 example: "647a9b6c1234567890abcdef"
 *               team_members:
 *                 type: array
 *                 description: Array of team members with their details
 *                 items:
 *                   type: object
 *                   properties:
 *                     userid:
 *                       type: string
 *                       description: User ID of the team member
 *                       example: "6476a63bf79ea71d30770de7"
 *                     dates:
 *                       type: array
 *                       description: Availability dates for the team member
 *                       items:
 *                         type: object
 *                         properties:
 *                           start_date:
 *                             type: string
 *                             format: date
 *                             description: Start date for the team member's availability
 *                             example: "2024-01-01"
 *                           end_date:
 *                             type: string
 *                             format: date
 *                             description: End date for the team member's availability
 *                             example: ""
 *     responses:
 *       200:
 *         description: Project team created successfully
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
 *                   example: "Project Team Created"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "647a9b6c1234567890abcdef"
 *                     project:
 *                       type: string
 *                       example: "647a9b6c1234567890abcdef"
 *                     status:
 *                       type: string
 *                       example: "On hold"
 *                     start_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     end_date:
 *                       type: string
 *                       format: date
 *                       example: "2024-12-31"
 *                     team_members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userid:
 *                             type: string
 *                             example: "6476a63bf79ea71d30770de7"
 *                           dates:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 start_date:
 *                                   type: string
 *                                   format: date
 *                                   example: "2024-01-01"
 *                                 end_date:
 *                                   type: string
 *                                   format: date
 *                                   example: ""
 *                           status:
 *                             type: string
 *                             example: "active"
 *       422:
 *         description: Validation failed
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
 *                   example: "Validation Failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "Field 'startDate' is required"
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
 *                 errors:
 *                   type: string
 *                   example: "Unexpected error occurred"
 */

    async addProjectTeam(req, res) {
        try {
    const{project}=req.body
            const validationResult = await projectTeamRequest.validateProjectTeam(req.body);
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message);
            }
    
            const projectDates=await projectRepo.getProjectDates(project)
     
       
            const updatedTeamMembers = req.body.team_members.map((member) => {
                return {
                    userid: member.userid,
                    dates: [
                        {
                            start_date: projectDates.actual_start_date,
                            end_date: "" 
                        }
                    ]
                };
            });
    
            
            const projectTeamData = {
                project: req.body.project,
                team_members: updatedTeamMembers
            };
    
     
            const newTeam = await projectTeamRepo.createTeam(projectTeamData);
    
        
            if (newTeam.status) {
                const data = await projectTeamResponse.formattedResponse(newTeam.data);
                res.status(200).json({
                    status: true,
                    message: "Project Team Created",
                    data: data
                });
            } else {
                res.status(422).json({
                    status: false,
                    message: "Failed to Add Project Team",
                    data: []
                });
            }
        } catch (error) {
        
            if (error instanceof CustomValidationError) {
                return res.status(422).json({
                    status: false,
                    message: "Validation Failed",
                    errors: error.errors
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: "Internal Server Error",
                    errors: error.message || error
                });
            }
        }
    }
    
    /**
 * @swagger
 * /admin/setenddate:
 *   post:
 *     summary: Update the `end_date` for a team member's date entry in a project team
 *     description: Updates the `end_date` for a specific team member in the nested `dates` array where `end_date` is currently `null`.
 *     tags: [ProjectTeams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ObjectId of the user (team member) whose `end_date` needs to be updated.
 *                 example: "6746a63bf79ea71d30770de9"
 *               projectTeamId:
 *                 type: string
 *                 description: The ObjectId of the project team where the user is part of the team.
 *                 example: "6763cd121df93faf8709cccc"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: The end date to be updated in the `dates` array of the team member.
 *                 example: "2024-12-30"
 *     responses:
 *       200:
 *         description: Successfully updated the `end_date`.
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
 *                   example: "End Date Set"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ObjectId of the project team.
 *                       example: "6763cd121df93faf8709cccc"
 *                     project:
 *                       type: string
 *                       description: The ObjectId of the associated project.
 *                       example: "674fd06e61ab1b7e3be98686"
 *                     status:
 *                       type: string
 *                       description: Status of the project team.
 *                       example: "On hold"
 *                     team_members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userid:
 *                             type: string
 *                             description: The ObjectId of the user (team member).
 *                             example: "6746a63bf79ea71d30770de9"
 *                           dates:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 start_date:
 *                                   type: string
 *                                   format: date
 *                                   description: Start date of the date entry.
 *                                   example: "2024-12-11T00:00:00.000Z"
 *                                 end_date:
 *                                   type: string
 *                                   format: date
 *                                   description: End date of the date entry.
 *                                   example: "2024-12-30T00:00:00.000Z"
 *                           status:
 *                             type: string
 *                             description: Status of the team member in the project.
 *                             example: "active"
 *       400:
 *         description: Invalid input data (e.g., missing required fields or invalid formats).
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
 *                   example: "Invalid input data."
 *       404:
 *         description: Project team or team member not found.
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
 *                   example: "Team Member not found."
 *       500:
 *         description: Server error while processing the request.
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
 *                   example: "Internal server error."
 */

    async setEndDateController(req,res)
    {

        const{projectTeamId,userId,end_date}=req.body
        try
        {
            const newDate=new Date(end_date)
            const timezone = await findTimeZone(req)
            let endDate = getLocalDateStringForTimezone(timezone, new Date(newDate))
            endDate=new Date(endDate)
            const data=await projectTeamRepo.setEndDateForTeammember(projectTeamId,userId,endDate)
            if(data.status)
            {
                res.status(200).json({
                    status:true,
                    message:"End Date Set",
                    data:data.data,
                })
            }
            else
            {
                res.status(422).json({
                    status:false,
                    message:"Failed to Set End Date",
                    data:[],
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
 * /admin/getallprojectteam:
 *   post:
 *     summary: Retrieve all project teams
 *     tags: [ProjectTeams]
 *     responses:
 *       200:
 *         description: Successfully retrieved all project teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   project_id:
 *                     type: string
 *                   projectname:
 *                     type: string
 *                   status:
 *                     type: string
 *                   date:
 *                     type: string
 *                   teamsMembers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         profilepic:
 *                           type: string
 *                         email:
 *                           type: string
 *       500:
 *         description: Server error
 */

    async getProjectTeam(req,res)
    {
        try
        {
            const data = await projectTeamRepo.getAllProjectTeam()
            if (data.length === 0) {
                res.status(422).json({
                    status:false,
                    message:"No Project Team Found",
                    data:[],
                })
                return
            }
            else
            {
                const formattedData = await Promise.all(
                    data.data.map(async (item) => {
                        return projectTeamResponse.formatProjectTeamSet(item); 
                    })
                );
                res.status(200).json({
                    status:true,
                    message:"Project team data",
                    data:formattedData,
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
 * /admin/getprojectteam:
 *   post:
 *     summary: Retrieve a specific project team by ID
 *     tags: [ProjectTeams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the project team to retrieve
 *                 example: "12345abcde"
 *     responses:
 *       200:
 *         description: Successfully retrieved project team data
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
 *                   example: "Project Team data"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345abcde"
 *                     project_id:
 *                       type: string
 *                       example: "54321edcba"
 *                     projectname:
 *                       type: string
 *                       example: "Project Alpha"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     teamMembers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user123"
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           profilepic:
 *                             type: string
 *                             example: "https://example.com/profile.jpg"
 *                           email:
 *                             type: string
 *                             example: "john.doe@example.com"
 *       422:
 *         description: No project team found
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
 *                   example: "No Category Found"
 *                 data:
 *                   type: array
 *                   items: []
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
 *                   items: []
 */

    async getProjectTeambyidController(req,res)
    {
        const {id}=req.body
     
        try
        {
            const data = await projectTeamRepo. getProjectTeambyId(id)
       
            if (data.length === 0) {
                res.status(422).json({
                    status:false,
                    message:"No Project Team  Found",
                    data:[],
                })
              
                return
            }
         
            else
            {
           
                const formattedData = await projectTeamResponse.formatTeamMembers(data[0])
                res.status(200).json({
                    status:true,
                    message:"Project Team data",
                    data:formattedData,
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
 * /admin/getprojectsbyemployee:
 *   post:
 *     summary: Get Projects by Employee ID
 *     description: Retrieve the projects where the specified employee is part of the team and return the project details.
 *     tags: [ProjectTeams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeid:
 *                 type: string
 *                 description: The unique ID of the employee whose projects are to be fetched.
 *                 example: "6746a63bf79ea71d30770de9"
 *     responses:
 *       200:
 *         description: Successfully retrieved the employee's projects.
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
 *                   example: "Project Team data"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       project:
 *                         type: object
 *                         properties:
 *                           project_name:
 *                             type: string
 *                             example: "Project Alpha"
 *                           project_lead:
 *                             type: object
 *                             properties:
 *                               full_name:
 *                                 type: string
 *                                 example: "John Doe"
 *                           client_name:
 *                             type: object
 *                             properties:
 *                               client_name:
 *                                 type: string
 *                                 example: "ACME Corp"
 *                       team_members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             userid:
 *                               type: string
 *                               example: "6746a63bf79ea71d30770de9"
 *                             status:
 *                               type: string
 *                               example: "active"
 *       422:
 *         description: No projects found for the specified employee.
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
 *                   example: "No Project Found"
 *                 data:
 *                   type: array
 *                   example: []
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
 *                   example: "Internal Server Error"
 *                 data:
 *                   type: array
 *                   example: []
 */

    async getEmployeeProjects(req,res)
    {
        const{employeeid}=req.body
        try
        {
            const data=await projectTeamRepo.getProjectsByEmployeeId(employeeid)
            if(data.length===0)
            {
                res.status(422).json({
                    status:false,
                    message:"No Project Found",
                    data:[],
                })
                return
            }
            else
            {
                const formattedData=await Promise.all(
                    data.map(async(item)=>{
                        return projectTeamResponse.formatAllEmployeeProjects(item)
                    })
                )
                res.status(200).json({
                    status:true,
                    message:"Project Team data",
                    data:formattedData,
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
 * /admin/activateuser:
 *   post:
 *     summary: Activate a user in the project team
 *     description: Activates a team member by adding a new entry in the `dates` array and setting the start date. Optionally, a start date can be provided; otherwise, the current date will be used.
 *     tags: [ProjectTeams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectTeamId
 *               - userId
 *             properties:
 *               projectTeamId:
 *                 type: string
 *                 description: The ID of the project team.
 *                 example: 6763cd121df93faf8709cccc
 *               userId:
 *                 type: string
 *                 description: The ID of the user to be activated.
 *                 example: 6746a63bf79ea71d30770de9
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: The start date for activation. If not provided, the current date will be used.
 *                 example: 2024-12-25T00:00:00.000Z
 *     responses:
 *       200:
 *         description: User activated successfully.
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
 *                   example: User Activated
 *                 data:
 *                   type: object
 *                   description: The updated project team data.
 *       422:
 *         description: Failed to activate the user.
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
 *                   example: Failed to Activate User
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
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
 *                   items:
 *                     type: string
 */

    async activateUserController(req,res)
    {
        let{projectTeamId,userId,start_date}=req.body
        try
        {
            if(!start_date)
            {
                start_date=new Date()
            }
            const newDate=new Date(start_date)
            const timezone = await findTimeZone(req)
            let startDate = getLocalDateStringForTimezone(timezone, new Date(newDate))
            startDate=new Date(startDate)
            const data=await projectTeamRepo.activateTeammember(projectTeamId,userId,startDate)
            if(data.status)
            {
                res.status(200).json({
                    status:true,
                    message:"User Activated",
                    data:data.data,
                })
            }
            else
            {
                res.status(422).json({
                    status:false,
                    message:"Failed to Activate User",
                    data:[],
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
 * /admin/editprojectteam:
 *   post:
 *     summary: Edit an existing project team
 *     tags: [ProjectTeams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "67481220d2193ae713064508"
 *               project:
 *                 type: string
 *                 example: "67481220d2193ae713064508" 
 *               status:
 *                 type: string
 *                 example: "In Progress"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               teamMembers:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: "teamMemberId"
 *     responses:
 *       200:
 *         description: Successfully updated the project team
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
 *                   example: "Project Team Updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "647a9b6c1234567890abcdef"
 *                     project:
 *                       type: string
 *                       example: "Project Alpha"
 *                     status:
 *                       type: string
 *                       example: "in Progress"
 *                     start_date:
 *                       type: string
 *                       example: "2024-01-01"
 *                     end_date:
 *                       type: string
 *                       example: "2024-12-31"
 *                     team_members:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "teamMemberId"
 *       422:
 *         description: Failed to update project team
 *       500:
 *         description: Internal Server Error
 */

    async editProjectTeamController(req,res)
    {
        try {
            const{id}=req.body
            const validationResult = await projectTeamRequest.validateUpdateProjectteam(req.body);
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message);
            } 
            const newTeam = await projectTeamRepo.updateProjectTeam(id,req.body);
            if(newTeam.status)
            {
                const  data=await projectTeamResponse.formattedResponse(newTeam.data)
                res.status(200).json(
                    {
                        status:true,
                        message:"Project Team Updated",
                        data:data,
                    })
            }
            else
            {
                res.status(422).json(
                    {
                        status:false,
                        message:"Failed to edit Project Team",
                        data:[],
                    })
            }
        } catch (error) {
            
                if (error instanceof CustomValidationError) {
                    return res.status(422).json({
                        status: false,
                        message: "Validation Failed",
                        errors: error.errors, 
                    });
                } else {
                    return res.status(500).json({
                        status: false,
                        message: "Internal Server Error",
                        errors: error.message || error,
                    });
            }
        }
    }    
}
export default ProjectTeamController