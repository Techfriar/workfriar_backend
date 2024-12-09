import Joi from "joi";
import Role from "../../models/role.js"; 
import User from "../../models/user.js";

class EmployeeRequest {
    static employeeSchema = Joi.object({
        name: Joi.string().required().messages({
            'string.base': `"Full name" should be a type of 'text'`,
            'string.empty': `"Full name" cannot be an empty field`,
            'any.required': `"Full name" is a required field`
        }),
        email: Joi.string().email().required().messages({
            'string.base': `"Email" should be a type of 'text'`,
            'string.empty': `"Email" cannot be an empty field`,
            'string.email': `"Email" must be a valid email format`,
            'any.required': `"Email" is a required field`
        }),
        role: Joi.string().required().messages({
            'string.base': `"Role" should be a type of 'text'`,
            'string.empty': `"Role" cannot be an empty field`,
            'any.required': `"Role" is a required field`
        }),
        reporting_manager: Joi.string().required().messages({
            'string.base': `"Reporting Manager" should be a type of 'text'`,
            'string.empty': `"Reporting Manager" cannot be an empty field`,
            'any.required': `"Reporting Manager" is a required field`
        }),
        location: Joi.string().required().messages({
            'string.base': `"Location" should be a type of 'text'`,
            'string.empty': `"Location" cannot be an empty field`,
            'any.required': `"Location" is a required field`
        }),
        status: Joi.string().required().messages({
            'string.base': `"Status" should be a type of 'text'`,
            'string.empty': `"Status" cannot be an empty field`,
            'any.required': `"Status" is a required field`,
        }),
    });

    async validateEmployee(data) {
        const { error } = EmployeeRequest.employeeSchema.validate(data);
        if (error) {
            return { isValid: false, message: error.details.map(err => err.message) };
        }
        try {
            const role = await Role.findOne({ _id: data.role });
            if (!role) {
                return { isValid: false, message: `Role '${data.role}' does not exist` };
            }
             const reportingManager = await User.findById(data.reporting_manager);
            if (!reportingManager) {
                return { isValid: false, message: `User with ID '${data.reporting_manager}' does not exist as a Reporting Manager` };
            } 

            return { isValid: true, message: "Employee data is valid, role and reporting manager exist" };
        } catch (err) {
            return { isValid: false, message: "Error occurred while validating the role or reporting manager" };
        }
    }
    async validateEmployeeEdit(data) {
        const { profile_pic, ...validationData } = data;
    
        const schema = Joi.object({
            id: Joi.string().required().messages({
                'string.empty': `"ID" cannot be an empty field`,
                'any.required': `"ID" is a required field`
            }),
            name: Joi.string().min(2).max(100).messages({
                'string.base': `"Name" should be a type of 'text'`,
                'string.min': `"Name" should have a minimum length of {#limit}`,
                'string.max': `"Name" should have a maximum length of {#limit}`
            }),
            email: Joi.string().email().messages({
                'string.email': `"Email" must be a valid email`,
                'string.empty': `"Email" cannot be an empty field`
            }),
            role: Joi.string().messages({
                'string.base': `"Role" should be a type of 'text'`,
                'string.empty': `"Role" cannot be an empty field`
            }),
            reporting_manager: Joi.string().messages({
                'string.base': `"Reporting Manager" should be a type of 'text'`,
                'string.empty': `"Reporting Manager" cannot be an empty field`
            }),
            location: Joi.string().messages({
                'string.base': `"Location" should be a type of 'text'`,
                'string.empty': `"Location" cannot be an empty field`
            }),
            status: Joi.string().valid('active', 'inactive').messages({
                'string.base': `"Status" should be a type of 'text'`,
                'any.only': `"Status" must be either 'active' or 'inactive'`
            }),
        }).min(2).messages({
            'object.min': `At least one field besides "ID" must be provided for update`
        });
    
        try {
            await schema.validateAsync(validationData, { abortEarly: false });
            
            if (validationData.role) {
                const role = await Role.findOne({ _id: validationData.role });
                if (!role) {
                    return { isValid: false, message: `Role '${validationData.role}' does not exist` };
                }
            }
            
            if (validationData.reporting_manager) {
                const reportingManager = await User.findById(validationData.reporting_manager);
                if (!reportingManager) {
                    return { isValid: false, message: `User with ID '${validationData.reporting_manager}' does not exist as a Reporting Manager` };
                }
            }
    
            return { isValid: true, message: "Employee edit data is valid" };
        } catch (error) {
            return {
                isValid: false,
                message: "Validation failed",
                errors: error.details.map(detail => detail.message)
            };
        }
    }    
}
export default EmployeeRequest;