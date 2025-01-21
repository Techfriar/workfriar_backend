import express from "express";
import multer from "multer";
import {
  checkPermissions,
} from "../middlewares/check-permission.js";
import ProjectController from "../controllers/admin/project-controller.js";
import { authenticateAdmin } from "../middlewares/authenticate-admin.js";

const projectRouter = express.Router();

const project = new ProjectController();

const upload = multer();


projectRouter
  .route("/add")
  .post(
    authenticateAdmin,
    upload.fields([{ name: "project_logo", maxCount: 1 }]),
    project.addProject
  );

  projectRouter
  .route("/list")
  .post(
    project.getAllProjects
  );
  projectRouter
  .route("/get/:id")
  .post(
    project.getProjectById
  );
  projectRouter
  .route("/update/:id")
  .post(
    authenticateAdmin,
    upload.fields([{ name: "project_logo", maxCount: 1 }]),
    project.updateProject
  );
  projectRouter.route("/changetimeentry").post(authenticateAdmin, project.updateTimeEntry)
  projectRouter.route("/updatestatus").post(authenticateAdmin, project.upddatestatus)

  /**
   * List all open projects where the user is included in the project team
   * For to select the project in the timesheet creation
   */
  projectRouter
    .route('/list-projects-by-user')
    .post(project.listAllOpenProjectsByUser)
  projectRouter
    .route('/get-projects-by-user')
    .post(project.getAllProjectsByUser)

  /**
   * List all categories under a project
   * For to select the category in the timesheet creation
   * @param {string} projectId
   */

  projectRouter
    .route('/get-categories')
    .post(project.getCategoriesByProject)

  projectRouter
    .route('/dropdown/:type')
    .post(project.getDropdownData);

export default projectRouter;
