import Joi from "joi";
import ProjectStatusReportRepository from "../../repositories/admin/project-status-report-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

export class AddProjectStatusReportRequest {
  static reportRepo = new ProjectStatusReportRepository();

  static schema = Joi.object({
    project_name: Joi.string().required().messages({
      "string.empty": "Please select the project.",
    }),
    project_lead: Joi.string().required().messages({
      "string.empty": "Please specify the project lead.",
      "any.required": "Please enter the project lead.",
    }),
    reporting_period: Joi.date().required().messages({
      "date.base": "Please enter a valid reporting period date.",
      "any.required": "Please enter the reporting period date.",
    }),
    progress: Joi.number().integer().min(0).max(100).required().messages({
      "number.base": "Progress must be a number.",
      "number.integer": "Progress must be an integer.",
      "number.min": "Progress cannot be less than 0.",
      "number.max": "Progress cannot exceed 100.",
      "any.required": "Please enter the progress.",
    }),
    comments: Joi.string().optional().allow("").allow(null),
    accomplishments: Joi.string().required().messages({
      "string.empty": "Please enter the accomplishments.",
    }),
    goals: Joi.string().required().messages({
      "string.empty": "Please enter the goals.",
    }),
    blockers: Joi.string().optional().allow("").allow(null),
  });

  constructor(req) {
    this.data = {
      project_name: req.body.project_name,
      project_lead: req.body.project_lead,
      reporting_period: req.body.reporting_period,
      progress: req.body.progress,
      comments: req.body.comments,
      accomplishments: req.body.accomplishments,
      goals: req.body.goals,
      blockers: req.body.blockers,
    };
  }

  async validate() {
    const { error, value } = AddProjectStatusReportRequest.schema.validate(
      this.data,
      {
        abortEarly: false,
      }
    );

    if (error) {
      // Collect validation errors as an array of objects
      const validationErrors = error.details.map((err) => ({
        field: err.context.key,
        message: err.message,
      }));

      throw new CustomValidationError(validationErrors);
    }

    return value;
  }
}
