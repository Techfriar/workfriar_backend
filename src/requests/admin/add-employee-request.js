import Joi from "joi";
import Role from "../../models/role.js"; 
import User from "../../models/user.js";
import UserRepository from "../../repositories/user-repository.js";
import { all } from "axios";

const userrepository=new UserRepository()
class EmployeeRequest {
    static employeeSchema = Joi.object({
        name: Joi.string()
            .pattern(/^[A-Za-z\s]+$/, 'letters and spaces')
            .required()
            .messages({
                'string.base': `"Username" should be a type of 'text'`,
                'string.empty': `"Username" cannot be an empty field`,
                'string.pattern.base': `"Username" can only contain letters and spaces`,
                'any.required': `"Username" is a required field`
            }),
    
        email: Joi.string().email().required().messages({
            'string.base': `"Email" should be a type of 'text'`,
            'string.empty': `"Email" cannot be an empty field`,
            'string.email': `"Email" must be a valid email format`,
            'any.required': `"Email" is a required field`
        }),
    
        role_id: Joi.string().required().messages({
            'string.base': `"Role" should be a type of 'text'`,
            'string.empty': `"Role" cannot be an empty field`,
            'any.required': `"Role" is a required field`
        }),
    
        phone_number: Joi.string()
            .pattern(/^[+]?[0-9]{1,3}?[-.\s]?(\(?\d{1,4}\)?[-.\s]?)?(\d{3}[-.\s]?){2,3}\d{1,4}$/, 'phone number')
            .required()
            .messages({
                'string.base': `"Phone Number" should be a type of 'text'`,
                'string.empty': `"Phone Number" cannot be an empty field`,
                'string.pattern.base': `"Phone Number" must be a valid format with at least 10 digits`,
                'any.required': `"Phone Number" is a required field`
            }),
    
        reporting_manager: Joi.string().required().messages({
            'string.base': `"Reporting Manager" should be a type of 'text'`,
            'string.empty': `"Reporting Manager" cannot be an empty field`,
            'any.required': `"Reporting Manager" is a required field`
        }),
    
        location: Joi.string()
        .valid('India', 'UAE', 'UK') 
        .required()
        .messages({
            'string.base': `"Location" should be a type of 'text'`,
            'string.empty': `"Location" cannot be an empty field`,
            'any.required': `"Location" is a required field`,
            'any.allowOnly': `"Location" must be one of the following values: India, UAE, UK`
        }),
    
        status: Joi.string().required().messages({
            'string.base': `"Status" should be a type of 'text'`,
            'string.empty': `"Status" cannot be an empty field`,
            'any.required': `"Status" is a required field`
        }),
       profile_pic:Joi.allow("").optional()
    });
    

    async validateEmployee(data) {
        const { error } = EmployeeRequest.employeeSchema.validate(data, { abortEarly: false });
    
        const errors = [];
        if (error) {
            errors.push(
                ...error.details.map((err) => ({
                    field: err.context.key === 'phone_number' ? 'Phone Number' : err.context.key, 
                    message: err.message.replace(/['"]/g, '').replace('phone_number', 'Phone Number'),
                }))
            );
        }
        try {
            const role = await Role.findOne({ _id: data.role_id });
            if (!role) {
                errors.push({
                    field: "role_id",
                    message: `Role '${data.role_id}' does not exist`,
                });
            }
            
            const existUser=await userrepository.getUserByEmail(data.email)
            if (existUser) {
                errors.push({
                    field: "email",
                    message: `Email '${data.email}' already exists`,
                });
            }
    
            const reportingManager = await User.findById(data.reporting_manager);
            if (!reportingManager) {
                errors.push({
                    field: "reporting_manager",
                    message: `User with ID '${data.reporting_manager}' does not exist as a Reporting Manager`,
                });
            }
        } catch (err) {
            console.error("Error during custom validation:", err);
            errors.push({
                field: "general",
                message: "Error occurred while validating the role or reporting manager",
            });
        }
        if (errors.length > 0) {
            return { isValid: false, errors };
        }
    
        return { isValid: true, message: "Employee data is valid, role and reporting manager exist" };
    }

    
    async validateEmployeeEdit(data) {
        const { profile_pic, ...validationData } = data;
        let errors = [];
        try {
      
        const { error } = EmployeeRequest.employeeSchema.validate(data, { abortEarly: false });
        if (error) {
            errors.push(
                ...error.details.map((err) => ({
                    field: err.context.key === 'phone_number' ? 'Phone Number' : err.context.key, 
                    message: err.message.replace(/['"]/g, '').replace('phone_number', 'Phone Number'),
                }))
            );
        }
    
            if (validationData.role_id) {
                const role = await Role.findOne({ _id: validationData.role_id });
                if (!role) {
                   errors.push({
                        field: "role_id",
                        message: `Role '${validationData.role_id}' does not exist`,
                    });
                }
            }
            const exisTingUser = await userrepository.getUserById(data.id);
            const allUsers = await userrepository.getAllUsers();
            
            const currentUserEmail = exisTingUser.email; 
            const incomingEmail = validationData.email;
            
            const emailExists = allUsers.some(user => user.email === incomingEmail && user.email !== currentUserEmail);
        
            if (emailExists) {
        
                errors.push({
                    field: "email",
                    message: `Email '${validationData.email}' already exists`,
                });
            } 
                       
            if (validationData.reporting_manager) {
                const reportingManager = await User.findById(validationData.reporting_manager);
                if (!reportingManager) {
                    errors.push({
                        field: "reporting_manager",
                        message: `User with ID '${validationData.reporting_manager}' does not exist as a Reporting Manager`,
                    });
                }
            }
            if (errors.length > 0) {
                return { isValid: false, errors };
            }
            return { isValid: true, message: "Employee edit data is valid" };
        } catch (error) {
      
            return {
                isValid: false,
                message: "Validation failed",
                errors: errors
            };
        }
    }
}
export default EmployeeRequest;