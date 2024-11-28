import Joi from 'joi';
class ProjectTeamRequest {

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



//function for validating project team
    async validateProjectTeam(input) {
        const { error } = ProjectTeamRequest.teamDataSchema.validate(input);
        if (error) {
            return { isValid: false, message: error.details.map(err => err.message) };
        }
       
            return { isValid: true, message: "Project team has no vaidation errror" };
    }

    //Function for validating category while updation
    async validateUpdateCategory(updateData)
    {
        const {error}=ProjectTeamRequest.updateCategorySchema.validate(updateData)
        if (error) {
            return { isValid: false, message: error.details.map(err => err.message) };
        }
        try {
            const existingCategories = await categoryRepo.getAllCategories();
            const existingCategoryNames = existingCategories.map(cat => cat.category.toLowerCase());
            if (existingCategoryNames.includes(updateData.category.toLowerCase())) {
                return { isValid: false, message: "Category already exists" };
            }
            return { isValid: true, message: "Category is valid and unique" };
        } catch (err) {
            return { isValid: false, message: "Error occurred while validating the category" };
        }
    }
}

export default ProjectTeamRequest