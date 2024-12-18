import Joi from 'joi';
import Project from '../../models/projects.js';
class ProjectTeamRequest {

    
   /**
     *Validate the users input for creating a new projec team
     * @param {Object} input - The request object from client side
     * @return {Object} - An object containing state and message whether the input is valid or not.
     */

static teamDataSchema = Joi.object({
    project: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/) 
        .messages({
            "any.required": "Project is required.",
            "string.pattern.base": "Project must be a valid ObjectId.",
        }),
    status: Joi.string()
        .required()
        .valid("Not Started","On hold","Cancelled","Completed") 
        .messages({
            "any.required": "Status is required.",
            "any.only": "Status must be Not Started,On hold,Cancelled,Completed .",
        }),
    startDate: Joi.date()
        .required()
        .messages({
            "any.required": "Start date is required.",
            "date.base": "Start date must be a valid date.",
        }),
    endDate: Joi.date() 
        .allow(null)
        .messages({
            "date.base": "End date must be a valid date.",
        }),
    teamMembers: Joi.array()
        .items(
            Joi.string()
                .required()
                .regex(/^[0-9a-fA-F]{24}$/) 
                .messages({
                    "any.required": "Each team member must be a valid ObjectId.",
                    "string.pattern.base": "Team member must be a valid ObjectId.",
                })
        )
        .min(1) 
        .required()
        .messages({
            "any.required": "Team members are required.",
            "array.min": "Team members must contain at least one user.",
        }),
});

static teamDataUpdateSchema = Joi.object({
    id:Joi.string().required(),
    project: Joi.string()
        .optional()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            "string.pattern.base": "Project must be a valid ObjectId.",
        }),
    status: Joi.string()
        .optional()
        .valid("Not Started", "On hold", "Cancelled", "Completed")
        .messages({
            "any.only": "Status must be one of: Not Started, On hold, Cancelled, Completed.",
        }),
    startDate: Joi.date()
        .optional()
        .messages({
            "date.base": "Start date must be a valid date.",
        }),
    endDate: Joi.date()
        .allow(null)
        .messages({
            "date.base": "End date must be a valid date.",
        }),
    teamMembers: Joi.alternatives()
        .try(
            Joi.array()
                .items(
                    Joi.string()
                        .regex(/^[0-9a-fA-F]{24}$/)
                        .messages({
                            "string.pattern.base": "Each team member must be a valid ObjectId.",
                        })
                )
                .min(1)
                .messages({
                    "array.min": "Team members must contain at least one user.",
                }),
            Joi.valid(null)
        )
        .optional()
        .messages({
            "any.only": "Team members must be a valid array or null.",
        }),
});

//function for validating project team
    async validateProjectTeam(input) {
        const { error } = ProjectTeamRequest.teamDataSchema.validate(input);
        const isExisting=await Project.findOne({_id:input.project})
        if(!isExisting)
        {
            return { isValid: false, message: "Project does not exist" };
        }
        if (error) {
            return { isValid: false, message: error.details.map(err => err.message) };
        }
       
            return { isValid: true, message: "Project team has no vaidation errror" };
    }

    //Function for validating project team while updation
    async validateUpdateProjectteam(updateData)
    {
        const {error}=ProjectTeamRequest.teamDataUpdateSchema.validate(updateData)
        if (error) {
            return { isValid: false, message: error.details.map(err => err.message) };
        }
            return { isValid: true, message: "Project team validation Success" };
    }
}

export default ProjectTeamRequest