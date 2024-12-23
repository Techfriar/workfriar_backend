import Joi from 'joi';
import mongoose from 'mongoose';
import PopulateData from '../../utils/currency-country-populate.js';
import UserRepository from '../../repositories/user-repository.js';
import ClientRepository from '../../repositories/admin/client-repository.js';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';

const UserRepo = new UserRepository();
const PopulateField = new PopulateData();
const ClientRepo = new ClientRepository()
 
export default class ClientRequest {
    /**
     * Validate client data and check references in the database
     * @param {Object} clientData - Data to validate
     * @throws {CustomValidationError} If validation fails or references do not exist
     * @returns {Object} - Validated data
     */

    async validateClientData(clientData) {
        // Define Joi schema
        const schema = Joi.object({
            client_name: Joi.string().required().messages({
                'string.base': '"client_name" must be a string',
                'any.required': '"client_name" is required',
            }),
            location: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for location');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"location" is required',
                }),
            client_manager: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for client_manager');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"client_manager" is required',
                }),
            billing_currency: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for billing_currency');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"billing_currency" is required',
                }),
            status: Joi.string()
                .valid('Active', 'Inactive')
                .required()
                .messages({
                    'any.only': '"status" must be either "Active" or "Inactive"',
                    'any.required': '"status" is required',
                }),
        });    

        const { error, value } = schema.validate(clientData);
        const errors = [];
        
        if (error) {
            errors.push(...error.details.map((err) => ({
                field: err.context.key,
                message: err.message,
            })));
        }

        if (errors.length > 0) {
            throw new CustomValidationError(errors);
        }

        const locationExists = await PopulateField.findCountry(value.location);
        if (!locationExists) {
            errors.push({
                field: 'location',
                message: 'Invalid location: Not found in countries collection',
            });
        }
    
        const clientManagerExists = await UserRepo.getUserById(value.client_manager);
        if (!clientManagerExists) {
            errors.push({
                field: 'client_manager',
                message: 'Invalid client_manager: Not found in users collection',
            });
        }
    
        const billingCurrencyExists = await PopulateField.findCurrency(value.billing_currency);
        if (!billingCurrencyExists) {
            errors.push({
                field: 'billing_currency',
                message: 'Invalid billing_currency: Not found in currencies collection',
            });
        }
    
        if (errors.length > 0) {
            throw new CustomValidationError(errors);
        }

        return value; 
    }   
    
    async validateEditClientData(clientData) {
        // Define Joi schema
        const schema = Joi.object({
            _id: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for _id');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"_id" is required',
                    'string.base': '"_id" must be a string',
                }),
            client_name: Joi.string().required().messages({
                'string.base': '"client_name" must be a string',
                'any.required': '"client_name" is required',
            }),
            location: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for location');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"location" is required',
                }),
            client_manager: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for client_manager');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"client_manager" is required',
                }),
            billing_currency: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for billing_currency');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"billing_currency" is required',
                }),
            status: Joi.string()
                .valid('Active', 'Inactive')
                .required()
                .messages({
                    'any.only': '"status" must be either "Active" or "Inactive"',
                    'any.required': '"status" is required',
                }),
        });
    
        const { error, value } = schema.validate(clientData);
        const errors = [];

        if (error) {
            errors.push(...error.details.map((err) => ({
                field: err.context.key,
                message: err.message,
            })));
        }

        if (errors.length > 0) {
            throw new CustomValidationError(errors);
        }

        const clientExists = await ClientRepo.findById(value._id);
        if (!clientExists) {
            errors.push({
                field: '_id',
                message: 'Invalid client: Not found in client collection',
            });
        }
    
        const locationExists = await PopulateField.findCountry(value.location);
        if (!locationExists) {
            errors.push({
                field: 'location',
                message: 'Invalid location: Not found in countries collection',
            });
        }
    
        const clientManagerExists = await UserRepo.getUserById(value.client_manager);
        if (!clientManagerExists) {
            errors.push({
                field: 'client_manager',
                message: 'Invalid client_manager: Not found in users collection',
            });
        }
    
        const billingCurrencyExists = await PopulateField.findCurrency(value.billing_currency);
        if (!billingCurrencyExists) {
            errors.push({
                field: 'billing_currency',
                message: 'Invalid billing_currency: Not found in currencies collection',
            });
        }
    
        if (errors.length > 0) {
            throw new CustomValidationError(errors);
        }
    
        return value; 
    }
    

    async validateClientStatus(client) {
        const schema = Joi.object({
            _id: Joi.string()
                .custom((value, helpers) => {
                    if (!mongoose.Types.ObjectId.isValid(value)) {
                        return helpers.message('Invalid ObjectId for _id');
                    }
                    return value;
                })
                .required()
                .messages({
                    'any.required': '"_id" is required',
                    'string.base': '"_id" must be a string',
                }),
            status: Joi.string()
                .valid('Active', 'Inactive')
                .required()
                .messages({
                    'any.only': '"status" must be either "Active" or "Inactive"',
                    'any.required': '"status" is required',
                }),
        });
    
        const { error, value } = schema.validate(client);
        const errors = [];
    
        if (error) {
            errors.push(...error.details.map((err) => ({
                field: err.context.key,
                message: err.message,
            })));
        }
    
        if (errors.length === 0) {
            const clientExists = await ClientRepo.findById(client._id);
            if (!clientExists) {
                errors.push({
                    field: '_id',
                    message: 'Invalid client: Not found in client collection',
                });
            }
        }
    
        if (errors.length > 0) {
            throw new CustomValidationError(errors);
        }
    
        return value;
    }
    
}
