import Joi from "joi";
import ProjectStatusReportRepository from "../../repositories/admin/project-status-report-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

export class UpdateProjectStatusReportRequest {
  static reportRepo = new ProjectStatusReportRepository();

  static schema = Joi.object({
    project_name: Joi.string().optional().messages({
      "string.empty": "Please select the project.",
    }),
    project_lead: Joi.string().optional().messages({
      "string.empty": "Please specify the project lead.",
    }),
    planned_start_date: Joi.date().optional().messages({
      "date.base": "Please enter a valid planned start date.",
    }),
    planned_end_date: Joi.date().optional().messages({
      "date.base": "Please enter a valid planned end date.",
    }),
    actual_start_date: Joi.date().optional().allow("").allow(null),
    actual_end_date: Joi.date().optional().allow("").allow(null),
    reporting_period: Joi.date().optional().messages({
      "date.base": "Please enter a valid reporting period.",
    }),
    progress: Joi.string().optional().messages({
      "string.empty": "Please enter the progress.",
    }),
    comments: Joi.string().optional().allow("").allow(null),
    accomplishments: Joi.string().optional().messages({
      "string.empty": "Please enter the accomplishments.",
    }),
    goals: Joi.string().optional().messages({
      "string.empty": "Please enter the goals.",
    }),
    blockers: Joi.string().optional().allow("").allow(null),
    reportId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),
  });

  constructor(req) {
    this.data = {
      project_name: req.body.project_name,
      project_lead: req.body.project_lead,
      planned_start_date: req.body.planned_start_date,
      planned_end_date: req.body.planned_end_date,
      actual_start_date: req.body.actual_start_date,
      actual_end_date: req.body.actual_end_date,
      reporting_period: req.body.reporting_period,
      progress: req.body.progress,
      comments: req.body.comments,
      accomplishments: req.body.accomplishments,
      goals: req.body.goals,
      blockers: req.body.blockers,
      reportId: req.params.id,
    };
  }

  async validate() {
    const filteredData = Object.fromEntries(
      Object.entries(this.data).filter(([_, v]) => v !== undefined)
    );

    // Validate only the fields that are present
    const fieldsToValidate = {};
    Object.keys(filteredData).forEach((key) => {
      if (filteredData[key] !== undefined) {
        fieldsToValidate[key] = filteredData[key];
      }
    });

    // Check if project status report exists
    const reportExists =
      await UpdateProjectStatusReportRequest.reportRepo.getProjectStatusReportById(
        this.data.reportId
      );

    if (!reportExists) {
      throw new CustomValidationError({
        report: "Project status report not found.",
      });
    }

    // Perform validation
    const { error, value } = UpdateProjectStatusReportRequest.schema
      .fork(Object.keys(fieldsToValidate), (schema) => schema.required())
      .validate(fieldsToValidate, {
        abortEarly: false,
        allowUnknown: true,
      });

    // Handle validation errors
    if (error) {
      const validationErrors = {};

      error.details.forEach((err) => {
        validationErrors[err.context.key] = err.message;
      });

      throw new CustomValidationError(validationErrors);
    }

    return filteredData;
  }
}
