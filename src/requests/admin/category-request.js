import Joi from 'joi';
import CategoryRepository from '../../repositories/admin/category-repository.js';

const categoryRepo = new CategoryRepository();

class CreateCategoryRequest {

    static categorySchema = Joi.object({
        category: Joi.string()

            .min(3)
            .max(50)
            .required()
            .messages({
                'string.base': 'Category must be a string',
                'string.empty': 'Category cannot be empty',
                'string.min': 'Category must be at least 3 characters long',
                'string.max': 'Category must be less than or equal to 50 characters',
                'any.required': 'Category is required'
            }),
            time_entry: Joi.string()
            .required()  
            .messages({
                'string.empty': 'Time Entry cannot be empty',
                'any.required': 'Time Entry is required'
            }),
    });

//function for comparing whether 
    async validateCategory(newCategory,timeentry) {
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
            console.error('Error in validateCategory:', err);
            return { isValid: false, message: "Error occurred while validating the category" };
        }
    }
}

export default CreateCategoryRequest;
