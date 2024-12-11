import Joi from "joi";
import ProjectStatusReportRepository from "../../repositories/admin/project-status-report-repository.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";

export class AddProjectStatusReportRequest {
    static reportRepo = new ProjectStatusReportRepository();

    static schema = Joi.object({
        project_name: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                "string.empty": "Please select the project.",
            }),
        project_lead: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                "string.empty": "Please specify the project lead.",
            }),
        planned_start_date: Joi.date().optional().messages({
            "date.base": "Please enter a valid planned start date.",
        }),
        planned_end_date: Joi.date().optional().messages({
            "date.base": "Please enter a valid planned end date.",
        }),
        actual_start_date: Joi.date().optional().messages({
            "date.base": "Please enter a valid actual start date.",
        }),
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
    });

    constructor(req) {
        this.data = req.body;
    }

    async validate() {
        // Remove undefined values from the data
        const filteredData = Object.fromEntries(
            Object.entries(this.data).filter(([_, v]) => v !== undefined)
        );

        // Validate only the fields that are present
        const { error, value } = AddProjectStatusReportRequest.schema.fork(
            Object.keys(filteredData), 
            (schema) => schema.required()
        ).validate(filteredData, {
            abortEarly: false,
            allowUnknown: true
        });

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

// Extended Request for Update
export class UpdateProjectStatusReportRequest extends AddProjectStatusReportRequest {
    constructor(req) {
        super(req);
        this.reportId = req.params.id;
    }

    async validate() {
        // First, validate the fields using the parent method
        const validatedData = await super.validate();

        // Validate the report ID format
        const reportIdSchema = Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                "string.empty": "Report ID is required.",
                "any.required": "Report ID is required.",
                "string.pattern.base": "Invalid Report ID format.",
            });

        const { error: reportIdError } = reportIdSchema.validate(this.reportId);

        if (reportIdError) {
            throw new CustomValidationError({
                reportId: "Invalid Report ID format."
            });
        }

        // Add the reportId to the validated data
        validatedData.reportId = this.reportId;

        return validatedData;
    }
}