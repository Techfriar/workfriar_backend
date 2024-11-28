import Joi from 'joi';
import CategoryRepository from '../../repositories/admin/category-repository.js';

const categoryRepo = new CategoryRepository();

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
        .valid("Open Entry", "Close Entry") 
        .messages({
            "any.required": "Status is required.",
            "any.only": "Status must be either 'Open Entry' or 'Close Entry'.",
        }),
    start_date: Joi.date()
        .required()
        .messages({
            "any.required": "Start date is required.",
            "date.base": "Start date must be a valid date.",
        }),
    end_date: Joi.date() 
        .allow(null)
        .messages({
            "date.base": "End date must be a valid date.",
        }),
    team_members: Joi.array()
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
    async validateProjectTeam(newCategory,timeentry) {
        const { error } = CreateCategoryRequest.categorySchema.validate({ category: newCategory,time_entry:timeentry });
        if (error) {
            return { isValid: false, message: error.details.map(err => err.message) };
        }
        try {
            const existingCategories = await categoryRepo.getAllCategories();
            const existingCategoryNames = existingCategories.map(cat => cat.category.toLowerCase());
            if (existingCategoryNames.includes(newCategory.toLowerCase())) {
                return { isValid: false, message: "Category already exists" };
            }
            return { isValid: true, message: "Category is valid and unique" };
        } catch (err) {
            return { isValid: false, message: "Error occurred while validating the category" };
        }
    }

    //Function for validating category while updation
    async validateUpdateCategory(updateData)
    {
        const {error}=CreateCategoryRequest.updateCategorySchema.validate(updateData)
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