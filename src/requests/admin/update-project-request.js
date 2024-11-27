import Joi from 'joi'
import ProjectRepository from '../../repositories/admin/project-repository.js'
import UserRepository from '../../repositories/admin/user-repository.js'
import { CustomValidationError } from '../../exceptions/custom-validation-error.js'

class UpdateProjectRequest {
    static projectRepo = new ProjectRepository()
    static userRepo = new UserRepository()

    static schema = Joi.object({
        client_name: Joi.string().required().messages({
            'string.empty': 'Please enter the client name.',
            'any.required': 'Please enter the client name.'
        }),
        project_name: Joi.string().required().messages({
            'string.empty': 'Please enter the project name.',
            'any.required': 'Please enter the project name.'
        }),
        description: Joi.string().required().messages({
            'string.empty': 'Please enter the project description.',
            'any.required': 'Please enter the project description.'
        }),
        planned_start_date: Joi.date().required().messages({
            'date.base': 'Please enter a valid planned start date.',
            'any.required': 'Please enter the planned start date.'
        }),
        planned_end_date: Joi.date().optional().allow('').allow(null),
        actual_start_date: Joi.date().optional().allow('').allow(null),
        actual_end_date: Joi.date().optional().allow('').allow(null),
        project_lead: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.empty': 'Please specify the project lead.',
                'any.required': 'Please specify the project lead.'
            }),
        billing_model: Joi.string().optional().allow('').allow(null),
        project_logo: Joi.object().optional().allow('').allow(null),
        open_for_time_entry: Joi.string().valid('opened', 'closed').required(),
        status: Joi.string()
            .valid('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled')
            .required(),
        projectId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
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

        // Check if project lead exists
        const checkproject_lead = await UpdateProjectRequest.userRepo.getUserById(
            this.data.project_lead
        )

        // Check if project exists
        const projectExists = await UpdateProjectRequest.projectRepo.getProjectById(
            this.data.projectId
        )

        if (error || checkProjectExists || !checkproject_lead || !projectExists) {
            const validationErrors = {}
            error
                ? error.details.forEach((err) => {
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