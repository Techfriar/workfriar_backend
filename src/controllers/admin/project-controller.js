import ProjectRepository from "../../repositories/admin/project-repository.js";
import AddProjectRequest from "../../requests/admin/add-project-request.js";
import UpdateProjectRequest from "../../requests/admin/update-project-request.js";
import ProjectResponse from "../../responses/project-response.js";
import {uploadFile, deleteFile} from "../../utils/uploadFile.js";
import UpdateStatusRequest from "../../requests/admin/update-project-status-request.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import CreateTimesheetRequest from "../../requests/admin/timesheet-request.js";

const projectRepo = new ProjectRepository();
const updateStatus = new UpdateStatusRequest();

export default class ProjectController {
  /**
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
   *                 description: Client ID for the project
   *               project_name:
   *                 type: string
   *                 description: Name of the project
   *               description:
   *                 type: string
   *                 description: Detailed description of the project
   *               planned_start_date:
   *                 type: string
   *                 format: date
   *                 description: Planned start date of the project (optional)
   *               planned_end_date:
   *                 type: string
   *                 format: date
   *                 description: Planned end date of the project (optional)
   *               actual_start_date:
   *                 type: string
   *                 format: date
   *                 description: Actual start date of the project (optional)
   *               actual_end_date:
   *                 type: string
   *                 format: date
   *                 description: Actual end date of the project (optional)
   *               project_lead:
   *                 type: string
   *                 description: User ID of the project lead
   *               billing_model:
   *                 type: string
   *                 description: Billing model for the project
   *                 enum:
   *                   - Bill time (time and materials)
   *                   - Bill milestones / Fixed fee
   *                   - Retainer
   *                   - Non billable
   *               project_logo:
   *                 type: string
   *                 format: binary
   *                 description: Project logo file (optional)
   *               open_for_time_entry:
   *                 type: string
   *                 description: Time entry status for the project
   *                 enum:
   *                   - opened
   *                   - closed
   *                 default: closed
   *               status:
   *                 type: string
   *                 description: Current status of the project
   *                 enum:
   *                   - Not Started
   *                   - In Progress
   *                   - Completed
   *                   - On Hold
   *                   - Cancelled
   *               categories:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of category IDs for the project
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
        const projectData =
          await ProjectResponse.formatGetAllProjectResponse(projectDetails);

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
      const { page = 1, limit = 10 } = req.body;

      const { projects, totalCount } = await projectRepo.getAllProjects({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      const formattedProjects = await Promise.all(
        projects.map(
          async (project) =>
            await ProjectResponse.formatGetAllProjectResponse(project)
        )
      );

      return res.status(200).json({
        status: true,
        message: "Projects retrieved successfully.",
        data: {
          projects: formattedProjects,
          pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve projects.",
        errors: error.message,
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

      const projectData =
        await ProjectResponse.formatGetByIdProjectResponse(project);

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
          details: error.message || "Unknown error occurred",
          code: error.code || "UNKNOWN_ERROR",
        },
      });
    }
  }

  /**
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
   *                 description: Client ID for the project
   *               project_name:
   *                 type: string
   *                 description: Name of the project
   *               description:
   *                 type: string
   *                 description: Detailed description of the project
   *               planned_start_date:
   *                 type: string
   *                 format: date
   *                 description: Planned start date of the project
   *               planned_end_date:
   *                 type: string
   *                 format: date
   *                 description: Planned end date of the project
   *               project_lead:
   *                 type: string
   *                 description: User ID of the project lead
   *               billing_model:
   *                 type: string
   *                 description: Billing model for the project
   *                 enum:
   *                   - Bill time (time and materials)
   *                   - Bill milestones / Fixed fee
   *                   - Retainer
   *                   - Non billable
   *               project_logo:
   *                 type: string
   *                 format: binary
   *                 description: Project logo file
   *               open_for_time_entry:
   *                 type: string
   *                 description: Time entry status for the project
   *                 enum:
   *                   - opened
   *                   - closed
   *               status:
   *                 type: string
   *                 description: Current status of the project
   *                 enum:
   *                   - Not Started
   *                   - In Progress
   *                   - Completed
   *                   - On Hold
   *                   - Cancelled
   *               categories:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of category IDs for the project
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
    let oldLogoPath = null;
    let newLogoPath = null;
    
    try {
      // First get the old project details to store the logo path
      const oldProject = await projectRepo.getProjectById(req.params.id);
      if (!oldProject) {
        return res.status(404).json({
          status: false,
          message: "Project not found.",
          data: null,
        });
      }
      
      // Store the old logo path if it exists
      oldLogoPath = oldProject.project_logo;

      // Validate the update request
      const validatedData = await new UpdateProjectRequest(req).validate();

      // Handle file upload if there's a new logo
      if (req.files && Object.keys(req.files).length > 0 && req.files.project_logo) {
        try {
          const fileArray = Array.isArray(req.files.project_logo) 
            ? req.files.project_logo 
            : [req.files.project_logo];

          for (const file of fileArray) {
            // Upload the new file first
            const uploadedFile = await uploadFile(file, "project-logos");
            
            if (uploadedFile.path) {
              newLogoPath = uploadedFile.path;
              
              // Only delete the old logo if we have successfully uploaded the new one
              if (oldLogoPath) {
                try {
                  await deleteFile(oldLogoPath);
                } catch (deleteError) {
                  console.error('Error deleting old logo:', deleteError);
                  // Continue with the update even if deletion fails
                }
              }
              
              validatedData.project_logo = newLogoPath;
            }
          }
        } catch (uploadError) {
          throw new CustomValidationError({
            project_logo: [`Failed to upload new logo: ${uploadError.message}`]
          });
        }
      }

      delete validatedData.projectId;

      const projectDetails = await projectRepo.updateProject(
        req.params.id,
        validatedData
      );

      if (projectDetails) {
        const projectData = await ProjectResponse.formatGetByIdProjectResponse(projectDetails);

        return res.status(200).json({
          status: true,
          message: "Project updated successfully.",
          data: projectData,
        });
      } else {
        // If update fails and we uploaded a new file, clean up the new file
        if (newLogoPath) {
          try {
            await deleteFile(newLogoPath);
          } catch (cleanupError) {
            console.error('Error cleaning up new logo after failed update:', cleanupError);
          }
        }

        return res.status(404).json({
          status: false,
          message: "Project not found or update failed.",
          data: null,
        });
      }
    } catch (error) {
      // If there was an error and we uploaded a new file, clean it up
      if (newLogoPath) {
        try {
          await deleteFile(newLogoPath);
        } catch (cleanupError) {
          console.error('Error cleaning up new logo after error:', cleanupError);
        }
      }

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

  async updateTimeEntry(req, res) {
    const { id, timeEntry, closeDate } = req.body;
    try {
      const validatedData = await updateStatus.validateTimeEntry(id, timeEntry);
      if (!validatedData.status) {
        throw new CustomValidationError(validatedData.message);
      }
      const data = await projectRepo.updateProjectTimeEntry(
        id,
        timeEntry,
        closeDate
      );
      if (data) {
        return res.status(200).json({
          status: true,
          message: "Entry Updated",
          data: [],
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Entry Updation Failed",
          data: null,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Internal Server Error",
        data: null,
      });
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

  async upddatestatus(req, res) {
    const { projectId, status } = req.body;
    try {
      const validatedData = await updateStatus.timeSheetValidation(projectId);
      if (!validatedData.success) {
        throw new CustomValidationError(validatedData.message);
      }
      const changeStatus = await projectRepo.updateProjectStatus(
        projectId,
        status
      );
      if (changeStatus) {
        return res.status(200).json({
          status: 200,
          message: "Project Status Updated",
          date: [],
        });
      } else {
        return res.status(200).json({
          status: 400,
          message: "Project Status Updation Failed",
          date: [],
        });
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
          data: null,
        });
      }
    }
  }
  /**
   * @swagger
   * /project/list-projects-by-user:
   *   post:
   *     tags:
   *     - Project
   *     summary: Get projects for the authenticated user  where user is a team member or project lead
   *     security:
   *       - bearerAuth: []
   *     description: Retrieves all projects where the authenticated user is a team member or project lead
   *     responses:
   *       200:
   *         description: Projects retrieved successfully
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
   *                   example: Projects retrieved successfully.
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       _id:
   *                         type: string
   *                       project_name:
   *                         type: string
   *
   *       400:
   *         description: Bad request (validation error)
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
   *                   example: Failed to retrieve projects.
   *                 data:
   *                   type: array
   *                   items: {}
   */

  /**
   * List all open projects where the user is included in the project team
   *
   */
  async listAllOpenProjectsByUser(req, res) {
    try {
      
      const user_id = req.session.user.id; 

      const projects = await projectRepo.getAllOpenProjectsByUser(user_id);
      const projectData = await Promise.all(
        projects.map(async (project) => {
          return await ProjectResponse.formatGetAllOpenProjectsByUserResponse(
            project
          );
        })
      );

      return res.status(200).json({
        status: true,
        message: "Projects retrieved successfully.",
        data: projectData,
      });
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: [],
        });
      }
      return res.status(500).json({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  /**
   * @swagger
   * /project/get-projects-by-user:
   *   post:
   *     tags:
   *       - Project
   *     summary: Get projects for the given userId where user is a team member or project lead
   *     security:
   *       - bearerAuth: []
   *     description: Retrieves all projects where the authenticated user is a team member or project lead
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *                 description: UserId for the user whose projects are needed
   *               page:
   *                 type: integer
   *                 description: Page number (default 1)
   *                 example: 1
   *               limit:
   *                 type: integer
   *                 description: Number of items per page (default 10)
   *                 example: 10
   *     responses:
   *       200:
   *         description: Projects retrieved successfully
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
   *                   example: Projects retrieved successfully.
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       _id:
   *                         type: string
   *                       project_name:
   *                         type: string
   *                       client:
   *                         type: string
   *                       startDate:
   *                         type: string
   *                       endDate:
   *                         type: string
   *                       project_lead:
   *                         type: string
   *                       status:
   *                         type: string
   *       400:
   *         description: Bad request (validation error)
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
   *                   example: Failed to retrieve projects.
   *                 data:
   *                   type: array
   *                   items: {}
   */

  /**
   * Get all projects where the user is included in the project team
   *
   */
  async getAllProjectsByUser(req, res) {
    try {
      // Authentication (uncomment and implement proper token verification in production)
      // const user_id = await authenticateAndGetUserId(req);

      const user_id = req.body.userId;

      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch total count of Projects by user
      const totalItems = await projectRepo.getProjectCountByUser(user_id);

      const projects = await projectRepo.getAllProjectsByUser(
        user_id,
        skip,
        limit
      );

      if (projects && projects.length > 0) {
        const projectData = await Promise.all(
          projects.map(async (project) => {
            return await ProjectResponse.formatGetAllProjectsByUserResponse(
              project
            );
          })
        );

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
          status: true,
          message: "Projects retrieved successfully.",
          data: projectData,
          pagination: {
            totalItems,
            currentPage: page,
            pageSize: limit,
            totalPages,
          },
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "No projects found.",
          data: [],
          pagination: {
            totalItems,
            currentPage: page,
            pageSize: limit,
            totalPages: 0,
          },
        });
      }
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: [],
        });
      }
      return res.status(500).json({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  /**
   * @swagger
   * /project/get-categories:
   *   post:
   *     tags:
   *       - Project
   *     summary: Get categories for a specific project
   *     description: Retrieves all categories associated with the given project ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - projectId
   *             properties:
   *               projectId:
   *                 type: string
   *                 description: The ID of the project to get categories for
   *     responses:
   *       200:
   *         description: Categories retrieved successfully
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
   *                   example: Categories retrieved successfully.
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       category:
   *                         type: string
   *                         description: The name of the category
   *                       categoryId:
   *                         type: string
   *                         description: The ID of the category
   *       400:
   *         description: Bad request (e.g., missing projectId)
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
   *                   example: Project ID is required.
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
   *                   example: Failed to retrieve categories.
   *                 data:
   *                   type: array
   *                   items: {}
   */
  async getCategoriesByProject(req, res) {
    try {
      const projectId = req.body.projectId;

      await CreateTimesheetRequest.validateProjectStatus(projectId);

      const categories = await projectRepo.getCategoriesByProject(projectId);

      return res.status(200).json({
        status: true,
        message: "Categories retrieved successfully.",
        data: categories || [],
      });
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(400).json({
          status: false,
          message: error.message,
          data: [],
        });
      }

      return res.status(500).json({
        status: false,
        message: error.message,
        data: [],
      });
    }
  }

  /**
   * Get Dropdown Data
   *
   * @swagger
   * /project/dropdown/{type}:
   *   post:
   *     tags:
   *       - Project
   *     summary: Get dropdown data for clients or project leads
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [clients, leads]
   *         description: Type of dropdown data to retrieve
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully retrieved dropdown data
   *       400:
   *         description: Invalid type parameter
   *       500:
   *         description: Internal Server Error
   */
  async getDropdownData(req, res) {
    const { type } = req.params;

    if (!["clients", "leads"].includes(type)) {
      return res.status(400).json({
        status: false,
        message: "Invalid dropdown type. Must be 'clients' or 'leads'.",
      });
    }

    try {
      const data = await projectRepo.getDropdownData(type);
      const entityType = type === "clients" ? "Client names" : "Project leads";

      return res.status(200).json({
        status: true,
        message: `${entityType} retrieved successfully.`,
        data: data,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: `Failed to retrieve ${type}.`,
        errors: error.message,
      });
    }
  }
}
