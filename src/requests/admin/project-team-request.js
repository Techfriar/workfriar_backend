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
        team_members: Joi.array()
        .items(
          Joi.object({
            userid: Joi.string()
              .regex(/^[0-9a-fA-F]{24}$/)
              .required()
              .messages({
                "string.pattern.base": "Each team member's 'userid' must be a valid ObjectId.",
                "any.required": "Team member 'userid' is required.",
              }),
            dates: Joi.array()
              .items(
                Joi.object({
                  start_date: Joi.date().optional().allow("").required().messages({
                    "date.base": "Start date must be a valid date.",
                    "any.required": "Start date is required for each date range.",
                  }),
                  end_date: Joi.date().optional().allow("").messages({
                    "date.base": "End date must be a valid date.",
                    "any.required": "End date is required for each date range.",
                  }),
                })
              )
              .min(1)
              .required()
              .messages({
                "array.base": "'dates' must be an array of objects.",
                "array.min": "At least one date range is required for each team member.",
              }),
            status: Joi.string()
              .valid("active", "inactive")
              .required()
              .messages({
                "any.only": "Team member status must be either 'active' or 'inactive'.",
                "any.required": "Team member status is required.",
              }),
          })
        )
        .min(1)
        .optional()
        .messages({
          "array.min": "Team members must contain at least one valid object.",
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
        team_members: Joi.array()
        .items(
          Joi.object({
            userid: Joi.string()
              .regex(/^[0-9a-fA-F]{24}$/)
              .required()
              .messages({
                "string.pattern.base": "Each team member's 'userid' must be a valid ObjectId.",
                "any.required": "Team member 'userid' is required.",
              }),
            dates: Joi.array()
              .items(
                Joi.object({
                  start_date: Joi.date().optional().allow("").required().messages({
                    "date.base": "Start date must be a valid date.",
                    "any.required": "Start date is required for each date range.",
                  }),
                  end_date: Joi.date().optional().allow("").messages({
                    "date.base": "End date must be a valid date.",
                    "any.required": "End date is required for each date range.",
                  }),
                })
              )
              .min(1)
              .required()
              .messages({
                "array.base": "'dates' must be an array of objects.",
                "array.min": "At least one date range is required for each team member.",
              }),
            status: Joi.string()
              .valid("active", "inactive")
              .required()
              .messages({
                "any.only": "Team member status must be either 'active' or 'inactive'.",
                "any.required": "Team member status is required.",
              }),
          })
        )
        .min(1)
        .optional()
        .messages({
          "array.min": "Team members must contain at least one valid object.",
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