import ProjectTeamRepository from "../repositories/admin/project-team-repository.js";
import ProjectTeamResponse from "../responses/projectteam-response.js";
import ProjectTeamRequest from "../requests/admin/project-team-request.js";
import { CustomValidationError } from "../exceptions/custom-validation-error.js";

const projectTeamRepo=new ProjectTeamRepository()
const projectTeamResponse=new ProjectTeamResponse()
const projectTeamRequest=new ProjectTeamRequest()

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
 *                 example: "Project Alpha"
 *               status:
 *                 type: string
 *                 example: "On hold"
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
 *                       example: "Project Alpha"
 *                     status:
 *                       type: string
 *                       example: "On hold"
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
 *         description: Failed to add project team
 *       500:
 *         description: Internal Server Error
 */
    async addProjectTeam(req,res)
    {
        try {
            const validationResult = await projectTeamRequest.validateProjectTeam(req.body);
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message);
            } 
            const newTeam = await projectTeamRepo.createTeam(req.body);
            if(newTeam)
            {
                const  data=await projectTeamResponse.formattedResponse(newTeam)
                res.status(200).json(
                    {
                        status:true,
                        message:"Project Team Created",
                        data:data,
                    })
            }
            else
            {
                res.status(422).json(
                    {
                        status:false,
                        message:"Failed to Add Project Team",
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
                    message:"No Category Found",
                    data:[],
                })
                return
            }
            else
            {
                const formattedData = await Promise.all(
                    data.map(async (item) => {
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
        const id=req.body
        try
        {
            const data = await projectTeamRepo. getProjectTeambyId(id)
            if (data.length === 0) {
                res.status(422).json({
                    status:false,
                    message:"No Category Found",
                    data:[],
                })
                return
            }
            else
            {
                const formattedData = await projectTeamResponse.formatProjectTeamSet(data)
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
 * /admin/editprojectteam/{id}:
 *   put:
 *     summary: Edit an existing project team
 *     tags: [ProjectTeams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project team to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 example: "Project Alpha"
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
        const id=req.params
        try {
            const validationResult = await projectTeamRequest.validateUpdateProjectteam(req.body);
            if (!validationResult.isValid) {
                throw new CustomValidationError(validationResult.message);
            } 
            const newTeam = await projectTeamRepo.updateProjectTeam(id,req.body);
            if(newTeam)
            {
                const  data=await projectTeamResponse.formattedResponse(newTeam)
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