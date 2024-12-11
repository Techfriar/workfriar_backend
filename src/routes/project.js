import express from "express";
import multer from "multer";
import {
  checkPermissions,
} from "../middlewares/check-permission.js";
import ProjectController from "../controllers/admin/project-controller.js";

const projectRouter = express.Router();

const project = new ProjectController();

const upload = multer();


projectRouter
  .route("/add")
  .post(
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
    upload.fields([{ name: "project_logo", maxCount: 1 }]),
    project.updateProject
  );
  projectRouter
  .route("/delete/:id")
  .post(
    project.deleteProject
  );
  projectRouter.route("/changetimeentry").post(project.updateTimeEntry)
  projectRouter.route("/updatestatus").post(project.upddatestatus)

  /**
   * List all projects where the user is included in the project team
   */
  projectRouter
    .route('/get-projects-by-user')
    .post(project.getProjectsByUser)


export default projectRouter;
