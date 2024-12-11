import ProjectRepository from "../../repositories/admin/project-repository.js";
import AddProjectRequest from "../../requests/admin/add-project-request.js";
import UpdateProjectRequest from "../../requests/admin/update-project-request.js";
import ProjectResponse from "../../responses/project-response.js";
import uploadFile from "../../utils/uploadFile.js";
import deleteFile from "../../utils/deleteFile.js";
import UpdateStatusRequest from "../../requests/admin/update-project-status-request.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import CreateTimesheetRequest from "../../requests/admin/timesheet-request.js";

const projectRepo = new ProjectRepository();
const updateStatus=new UpdateStatusRequest();

export default class ProjectController {
  /**
   * Add Project
   *
   * @swagger
   * /project/add:
   *   post:
   *     tags:
   *       - Project
   *     summary: Add project
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               client_name:
   *                 type: string
   *                 description: Enter client name
   *               project_name:
   *                 type: string
   *                 description: Enter project name
   *               description:
   *                 type: string
   *                 description: Enter project description
   *               planned_start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter planned start date
   *               planned_end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter planned end date
   *               actual_start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter actual start date
   *               actual_end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter actual end date
   *               project_lead:
   *                 type: string
   *                 description: Enter project lead user id
   *               billing_model:
   *                 type: string
   *                 description: Enter billing model
   *               categories:
   *                  type: array of string
   *                  description: Enter categories
   *               project_logo:
   *                 type: string
   *                 format: binary
   *                 description: Upload project logo
   *               open_for_time_entry:
   *                 type: string
   *                 description: Enter time entry status (opened/closed)
   *               status:
   *                 type: string
   *                 description: Enter project status
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async addProject(req, res) {
    try {
      const validatedData = await new AddProjectRequest(req).validate();

      if (req.files && req.files.project_logo) {
        const fileArray = Array.isArray(req.files.project_logo)
          ? req.files.project_logo
          : [req.files.project_logo];

        for (const file of fileArray) {
          const uploadedFile = await uploadFile(file);

          if (uploadedFile.path) {
            validatedData.project_logo = uploadedFile.path;
          }
        }
      }

      const projectDetails = await projectRepo.addProject(validatedData);

      if (projectDetails) {
        const projectData = await ProjectResponse.format(projectDetails);

        return res.status(200).json({
          status: true,
          message: "Project added successfully.",
          data: projectData,
        });
      } else {
        return res.status(422).json({
          status: false,
          message: "Failed to add project.",
          data: [],
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Failed to add project.",
        errors: error.message || error,
      });
    }
  }
  /**
   * Get All Projects
   *
   * @swagger
   * /project/list:
   *   post:
   *     tags:
   *       - Project
   *     summary: Get all projects
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               page:
   *                 type: integer
   *                 description: Page number
   *               limit:
   *                 type: integer
   *                 description: Number of items per page
   *               status:
   *                 type: string
   *                 description: Filter by status
   *               client_name:
   *                 type: string
   *                 description: Filter by client name
   *               project_name:
   *                 type: string
   *                 description: Filter by project name
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async getAllProjects(req, res) {
    try {
      const projects = await projectRepo.getAllProjects();

      const formattedProjects = await Promise.all(
        projects.map(async (project) => await ProjectResponse.format(project))
      );

      return res.status(200).json({
        status: true,
        message: "Projects retrieved successfully.",
        data: {
          projects: formattedProjects,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve projects.",
        errors: error,
      });
    }
  }

  /**
   * Get Project By Id
   *
   * @swagger
   * /project/get/{id}:
   *   post:
   *     tags:
   *       - Project
   *     summary: Get project by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 description: Filter by status
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal Server Error
   */
  async getProjectById(req, res) {
    try {
      const project = await projectRepo.getProjectById(req.params.id);

      if (!project) {
        return res.status(404).json({
          status: false,
          message: "Project not found.",
          data: null,
        });
      }

      const projectData = await ProjectResponse.format(project);

      return res.status(200).json({
        status: true,
        message: "Project retrieved successfully.",
        data: projectData,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve project.",
        errors: {
          details: error.message || 'Unknown error occurred',
          code: error.code || 'UNKNOWN_ERROR'
        }
      });
    }
  }

  /**
   * Update Project
   *
   * @swagger
   * /project/update/{id}:
   *   post:
   *     tags:
   *       - Project
   *     summary: Update project
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               client_name:
   *                 type: string
   *                 description: Enter client name
   *               project_name:
   *                 type: string
   *                 description: Enter project name
   *               description:
   *                 type: string
   *                 description: Enter project description
   *               planned_start_date:
   *                 type: string
   *                 format: date
   *                 description: Enter planned start date
   *               planned_end_date:
   *                 type: string
   *                 format: date
   *                 description: Enter planned end date
   *               project_lead:
   *                 type: string
   *                 description: Enter project lead user id
   *               billing_model:
   *                 type: string
   *                 description: Enter billing model
   *               project_logo:
   *                 type: string
   *                 format: binary
   *                 description: Upload project logo
   *               open_for_time_entry:
   *                 type: string
   *                 description: Enter time entry status (opened/closed)
   *               status:
   *                 type: string
   *                 description: Enter project status
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal Server Error
   */
  async updateProject(req, res) {
    try {
      const validatedData = await new UpdateProjectRequest(req).validate();

      if (req.files && Object.keys(req.files).length > 0) {
        if (req.files.project_logo) {
          const fileArray = req.files.project_logo;
          for (const file of fileArray) {
            const uploadedFile = await uploadFile(file);

            if (uploadedFile.path) {
              // Delete the old logo if it exists
              const oldProject = await projectRepo.getProjectById(
                req.params.id
              );
              if (oldProject.project_logo) {
                await deleteFile(oldProject.project_logo);
              }

              validatedData.project_logo = uploadedFile.path;
            }
          }
        }
      }

      delete validatedData.projectId;

      const projectDetails = await projectRepo.updateProject(
        req.params.id,
        validatedData
      );

      if (projectDetails) {
        const projectData = await ProjectResponse.format(projectDetails);

        return res.status(200).json({
          status: true,
          message: "Project updated successfully.",
          data: projectData,
        });
      } else {
        return res.status(404).json({
          status: false,
          message: "Project not found.",
          data: null,
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Failed to update project.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Delete Project
   *
   * @swagger
   * /project/delete/{id}:
   *   post:
   *     tags:
   *       - Project
   *     summary: Delete project
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Project ID
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal Server Error
   */
  async deleteProject(req, res) {
    try {
      const project = await projectRepo.getProjectById(req.params.id);

      if (!project) {
        return res.status(404).json({
          status: false,
          message: "Project not found.",
          data: null,
        });
      }

      if (project.project_logo) {
        await deleteFile(project.project_logo);
      }

      await projectRepo.deleteProject(req.params.id);

      return res.status(200).json({
        status: true,
        message: "Project deleted successfully.",
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to delete project.",
        errors: error,
      });
    }
  }

  /**
 * @swagger
 * /project/changetimeentry:
 *   post:
 *     tags:
 *       - Project
 *     summary: Update time entry for a project
 *     description: Update a time entry and optionally provide a close date for the project.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - timeEntry
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the project to update the time entry for.
 *                 example: "6489a9d1287e5a7d2f894ba7"
 *               timeEntry:
 *                 type: string
 *                 description: The time entry data to update.
 *                 example: "opened"
 *               closeDate:
 *                 type: string
 *                 format: date-time
 *                 description: The optional close date for the project.
 *                 example: "2024-11-28T12:39:23.000Z"
 *     responses:
 *       200:
 *         description: Time entry successfully updated.
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
 *                   example: "Entry Updated"
 *                 data:
 *                   type: array
 *                   example: []
 *       400:
 *         description: Time entry update failed.
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
 *                   example: "Entry Updation Failed"
 *                 data:
 *                   type: null
 *                   example: null
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
 *                   type: null
 *                   example: null
 */

  async updateTimeEntry(req,res)
  {
    const {id,timeEntry,closeDate} =req.body
    try
    {
      const validatedData =await updateStatus.validateTimeEntry(id,timeEntry)
      if(!validatedData.status)
        {
              throw new CustomValidationError(validatedData.message)
        }
      const data = await projectRepo.updateProjectTimeEntry(id,timeEntry,closeDate);
      if(data)
      {
        return res.status(200).json({
          status:true,
          message:"Entry Updated",
          data:[]
        })
      }
      else
      {
        return res.status(400).json({
          status:false,
          message:"Entry Updation Failed",
          data:null
        })
      }
    }catch(error)
    {
    return res.status(500).json({
      status:false,
      message:"Internal Server Error",
      data:null
    })
    }
  }
  /**
 * @swagger
 * /project/updatestatus:
 *   post:
 *     tags:
 *       - Project
 *     summary: Update project status
 *     description: Change the status of a project by providing the project ID and the new status.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - status
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: The ID of the project to update the status for.
 *                 example: "6489a9d1287e5a7d2f894ba7"
 *               status:
 *                 type: string
 *                 description: The new status for the project.
 *                 enum:
 *                   - Not Started
 *                   - On hold
 *                   - Cancelled
 *                   - Completed
 *                 example: "Completed"
 *     responses:
 *       200:
 *         description: Project status successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Project Status Updated"
 *                 data:
 *                   type: array
 *                   example: []
 *       400:
 *         description: Project status update failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Project Status Updation Failed"
 *                 data:
 *                   type: array
 *                   example: []
 *       422:
 *         description: Validation failed for the request data.
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
 *                   example:
 *                     - "Project ID is invalid"
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
 *                   type: null
 *                   example: null
 */

  async upddatestatus(req,res)
  {
    const{projectId,status}=req.body
    try
    {
      const validatedData =await updateStatus.timeSheetValidation(projectId)
      if(!validatedData.success)
      {
            throw new CustomValidationError(validatedData.message)
      }
    const changeStatus=await projectRepo.updateProjectStatus(projectId,status)
     if(changeStatus)
     {
      return res.status(200).json({
        status:200,
        message:"Project Status Updated",
        date:[]
      })
     }
     else
     {
      return res.status(200).json({
        status:400,
        message:"Project Status Updation Failed",
        date:[]
      })
     }
    }
    catch(error)
    {
      
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
            status: false,
            message: "Validation Failed",
            errors: error.errors, 
        });
    } else {
      return res.status(500).json({
        status:false,
        message:"Internal Server Error",
        data:null
      })
    }
  }
  }

  /**
   * List all projects where the user is included in the project team
   * 
   */
  async getProjectsByUser(req, res) {
    try {
      // Authentication (uncomment and implement proper token verification in production)
			// const user_id = await authenticateAndGetUserId(req);
			const user_id = '6746a63bf79ea71d30770de7'; // Temporary user ID

      const projects = await projectRepo.getAllProjectsByUser(user_id);

      if (!projects) {
        return res.status(404).json({
          status: false,
          message: "Projects not found.",
          data: [],
        });
      }

      const projectData = await ProjectResponse.format(projects);

      return res.status(200).json({
        status: true,
        message: "Projects retrieved successfully.",
        data: projectData,
      });
    } catch (error) {
      if(error instanceof CustomValidationError){
        return res.status(400).json({
          status: false,
          message: error.message,
          data: []
        })
      }
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve projects.",
        data: []
      });
    }
  }
}
