import ProjectRepository from "../../repositories/admin/project-repository.js";
import AddProjectRequest from "../../requests/admin/add-project-request.js";
import UpdateProjectRequest from "../../requests/admin/update-project-request.js";
import ProjectResponse from "../../responses/project-response.js";
import uploadFile from "../../utils/uploadFile.js";
import deleteFile from "../../utils/deleteFile.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
const projectRepo = new ProjectRepository();

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
   *   put:
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
   *   delete:
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
}
