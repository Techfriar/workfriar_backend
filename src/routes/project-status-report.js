import express from "express";
import {
  checkPermissions,
} from "../middlewares/check-permission.js";
import ProjectStatusReportController from "../controllers/admin/project-status-report-controller.js";

const projectStatusRouter = express.Router();

const projectStatusReport = new ProjectStatusReportController();

projectStatusRouter
  .route("/add-report")
  .post(
    projectStatusReport.addReport
  );

  projectStatusRouter
  .route("/list-report")
  .post(
    projectStatusReport.getAllReports
  );
  projectStatusRouter
  .route("/get-report/:id")
  .post(
    projectStatusReport.getReportById
  );
  projectStatusRouter
  .route("/update-report/:id")
  .post(
    projectStatusReport.updateReport
  );
  projectStatusRouter
  .route("/delete-report/:id")
  .post(
    projectStatusReport.deleteReport
  );

export default projectStatusRouter;
