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
  .put(
    upload.fields([{ name: "project_logo", maxCount: 1 }]),
    project.updateProject
  );
  projectRouter
  .route("/delete/:id")
  .delete(
    project.deleteProject
  );

export default projectRouter;
