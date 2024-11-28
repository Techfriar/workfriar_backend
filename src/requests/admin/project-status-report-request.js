import Joi from "joi";
import ProjectStatusReportRepository from "../../repositories/admin/project-status-report-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

export class AddProjectStatusReportRequest {
    static reportRepo = new ProjectStatusReportRepository();

    static schema = Joi.object({
        project_name: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.empty": "Please select the project.",
                "any.required": "Please select the project.",
            }),
        project_lead: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.empty": "Please specify the project lead.",
                "any.required": "Please specify the project lead.",
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
        actual_end_date: Joi.date().optional().allow("").allow(null),
        reporting_period: Joi.date().required().messages({
            "date.base": "Please enter a valid reporting period.",
            "any.required": "Please enter the reporting period.",
        }),
        progress: Joi.string().required().messages({
            "string.empty": "Please enter the progress.",
            "any.required": "Please enter the progress.",
        }),
        comments: Joi.string().optional().allow("").allow(null),
        accomplishments: Joi.string().required().messages({
            "string.empty": "Please enter the accomplishments.",
            "any.required": "Please enter the accomplishments.",
        }),
        goals: Joi.string().required().messages({
            "string.empty": "Please enter the goals.",
            "any.required": "Please enter the goals.",
        }),
        blockers: Joi.string().optional().allow("").allow(null),
    });

    constructor(req) {
        this.data = req.body;
    }

    async validate() {
        const { error, value } = AddProjectStatusReportRequest.schema.validate(
            this.data,
            { abortEarly: false }
        );

        if (error) {
            const validationErrors = {};
            error.details.forEach((err) => {
                validationErrors[err.context.key] = err.message;
            });
            throw new CustomValidationError(validationErrors);
        }

        return value;
    }
}

// Extended Request for Update
export class UpdateProjectStatusReportRequest extends AddProjectStatusReportRequest {
    constructor(req) {
        super(req);
        this.reportId = req.params.id;
    }

    async validate() {
        const schema = AddProjectStatusReportRequest.schema.keys({
            reportId: Joi.string()
                .regex(/^[0-9a-fA-F]{24}$/)
                .required()
                .messages({
                    "string.empty": "Report ID is required.",
                    "any.required": "Report ID is required.",
                    "string.pattern.base": "Invalid Report ID format.",
                }),
        });

        const validationData = {
            ...this.data,
            reportId: this.reportId,
        };

        const { error, value } = schema.validate(validationData, {
            abortEarly: false,
        });

        if (error) {
            const validationErrors = {};
            error.details.forEach((err) => {
                validationErrors[err.context.key] = err.message;
            });
            throw new CustomValidationError(validationErrors);
        }

        return value;
    }
}
