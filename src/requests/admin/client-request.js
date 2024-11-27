import Joi from 'joi';
import ClientRepository from '../../repositories/admin/client-repository.js';

class ClientRequest {
    static clientRepo = new ClientRepository();

    // Add validation checks for request
    static schema = Joi.object({
        _id: Joi.string()
        .optional()
        .messages({
            'string.base': '_id must be a string',
        }),
        client_name: Joi.string()
            .min(1)
            .required()
            .messages({
                'string.empty': 'Client name is required',
                'any.required': 'Client name field is required',
            }),
        location: Joi.string()
            .min(1)
            .required()
            .messages({
                'string.empty': 'Location is required',
                'any.required': 'Location field is required',
            }),
        client_manager: Joi.string()
            .min(1)
            .required()
            .messages({
                'string.empty': 'Client manager is required',
                'any.required': 'Client manager field is required',
            }),
        billing_currency: Joi.string()
            .min(1)
            .required()
            .messages({
                'string.empty': 'Billing currency is required',
                'any.required': 'Billing currency field is required',
            }),
        status: Joi.string()
            .valid('Not started','In progress','On hold','Cancelled')
            .required()
            .messages({
                'any.required': 'Status is required',
                'any.only': 'Status must be either of these values Not started, In progress, On hold, Cancelled',
            }),
    });

    constructor(data) {
        this.data = data;
    }

    async validate() {
        const { error, value } = ClientRequest.schema.validate(this.data, {
            abortEarly: false,
        });

        if (error) {
            const validationErrors = {};
            error.details.forEach((err) => {
                validationErrors[err.context.key] = err.message;
            });
            return { error: validationErrors, value: null };
        }

        // Check if the client already exists
        const existingClient = await ClientRequest.clientRepo.findExistingClient(this.data);

        if (existingClient) {
            return {
                error: { client: 'Client with these details already exists' },
                value: null,
            };
        }

        return { error: null, value };
    }

    async validateForEdit() {
        // Validate request body using the existing schema
        const { error, value } = ClientRequest.schema.validate(this.data, {
            abortEarly: false,
        });
    
        if (error) {
            const validationErrors = {};
            error.details.forEach((err) => {
                validationErrors[err.context.key] = err.message;
            });
            return { error: validationErrors, value: null };
        }
    
        // Check if the client exists for the given ID
        const existingClient = await ClientRequest.clientRepo.findById(this.data._id);
    
        if (!existingClient) {
            return {
                error: { client: 'Client not found in the database' },
                value: null,
            };
        }
    
        return { error: null, value };
    }
    
}

export default ClientRequest;