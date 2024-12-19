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
    planned_start_date: Joi.date().required().messages({
      "date.base": "Please enter a valid planned start date.",
      "any.required": "Please enter the planned start date.",
    }),
    planned_end_date: Joi.date().required().messages({
      "date.base": "Please enter a valid planned end date.",
      "any.required": "Please enter the planned end date.",
    }),
    actual_start_date: Joi.date().required().messages({
      "date.base": "Please enter a valid actual start date.",
      "any.required": "Please enter the actual start date.",
    }),
    actual_end_date: Joi.date().required().messages({
      "date.base": "Please enter a valid actual end date.",
      "any.required": "Please enter the actual end date.",
    }),
    reporting_period: Joi.date().required().messages({
      "date.base": "Please enter a valid reporting period date.",
      "any.required": "Please enter the reporting period date.",
    }),
    progress: Joi.string().required().messages({
      "string.empty": "Please enter the progress.",
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
