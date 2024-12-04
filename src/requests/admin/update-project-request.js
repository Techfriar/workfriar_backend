import Joi from 'joi'
import ProjectRepository from '../../repositories/admin/project-repository.js'
import { CustomValidationError } from '../../exceptions/custom-validation-error.js'


class UpdateProjectRequest {
    static projectRepo = new ProjectRepository()

    static schema = Joi.object({
        client_name: Joi.string().optional().messages({
            'string.empty': 'Please enter the client name.',
            'any.optional': 'Please enter the client name.'
        }),
        project_name: Joi.string().optional().messages({
            'string.empty': 'Please enter the project name.',
            'any.optional': 'Please enter the project name.'
        }),
        description: Joi.string().optional().messages({
            'string.empty': 'Please enter the project description.',
            'any.optional': 'Please enter the project description.'
        }),
        planned_start_date: Joi.date().optional().messages({
            'date.base': 'Please enter a valid planned start date.',
            'any.optional': 'Please enter the planned start date.'
        }),
        project_lead: Joi.string().optional().messages({
            'string.empty': 'Please enter the project lead.',
            'any.optional': 'Please enter the project lead.'
        }),
        planned_end_date: Joi.date().optional().allow('').allow(null),
        actual_start_date: Joi.date().optional().allow('').allow(null),
        actual_end_date: Joi.date().optional().allow('').allow(null),
        billing_model: Joi.string().optional().allow('').allow(null),
        project_logo: Joi.object().optional().allow('').allow(null),
        open_for_time_entry: Joi.string().valid('opened', 'closed').optional(),
        status: Joi.string()
            .valid('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled')
            .optional(),
        projectId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional()
    })

    constructor(req) {
        const file = req.files['project_logo'] ? req.files['project_logo'][0] : null

        this.data = {
            client_name: req.body.client_name,
            project_name: req.body.project_name,
            description: req.body.description,
            planned_start_date: req.body.planned_start_date,
            planned_end_date: req.body.planned_end_date,
            actual_start_date: req.body.actual_start_date,
            actual_end_date: req.body.actual_end_date,
            project_lead: req.body.project_lead,
            billing_model: req.body.billing_model,
            project_logo: file,
            open_for_time_entry: req.body.open_for_time_entry,
            status: req.body.status,
            projectId: req.params.id
        }
    }

    async validate() {
        const { error, value } = UpdateProjectRequest.schema.validate(this.data, {
            abortEarly: false
        })

        // Check if project exists with same name (excluding current project)
        const checkProjectExists = await UpdateProjectRequest.projectRepo.checkProjectExists(
            this.data.project_name,
            this.data.client_name,
            this.data.projectId
        )

        // Check if project exists
        const projectExists = await UpdateProjectRequest.projectRepo.getProjectById(
            this.data.projectId
        )

        if (error || checkProjectExists || !projectExists) {
            const validationErrors = {}
            error? error.details.forEach((err) => {
                    validationErrors[err.context.key] = err.message
                })
                : []

            if (checkProjectExists) {
                validationErrors['project_name'] = 
                    'Project with this name already exists for the client.'
            }


            if (!projectExists) {
                validationErrors['project'] = 'Project not found.'
            }

            throw new CustomValidationError(validationErrors);
        }

        return value
    }

}


export default UpdateProjectRequest