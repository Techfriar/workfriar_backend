import Joi from 'joi'
import UserRepository from '../../../repositories/userRepository.js'
import RoleRepository from '../../../repositories/roleRepository.js'
import cleanErrorMessage from '../../../utils/cleanErrorMessage.js'

class AddUserRequest {
    static userRepo = new UserRepository()
    static roleRepo = new RoleRepository()

    /**
     * Add validation rules for the request
     */
    static schema = Joi.object({
        name: Joi.string().required().messages({
            'string.empty': 'Please enter the full name of the user.',
            'any.required': 'Please enter the full name of the user.',
        }),
        email: Joi.string().email().required().messages({
            'string.empty': 'Please enter a valid email address.',
            'any.required': 'Please enter a valid email address.',
            'string.email': 'Please enter a valid email address.',
        }),
        gender: Joi.string()
            .valid('male', 'female', 'other')
            .required()
            .messages({
                'string.empty':
                    'Gender is a required field. Please choose the appropriate option.',
                'any.required':
                    'Gender is a required field. Please choose the appropriate option.',
            }),
        country_code: Joi.string()
            .pattern(/^\+[0-9]+$/)
            .required(),
        country_unicode: Joi.string().required(),
        phone: Joi.number().required().messages({
            'number.empty': 'Please enter a valid phone number.',
            'any.required': 'Please enter a valid phone number.',
            'number.base': 'Please enter a valid phone number.',
        }),
        address: Joi.string().allow(''),
        postal_code: Joi.number().allow(''),
        city: Joi.string().allow(''),
        country: Joi.string().allow(''),
        emirate: Joi.string().allow(''),
        role_id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.empty': 'Please specify the role of the user.',
                'any.required': 'Please specify the role of the user.',
            }),
        file: Joi.object().optional().optional().allow('').allow(null),
        user_id: Joi.string().required().messages({
            'string.empty': 'Please enter user id.',
            'any.required': 'Please enter user id.',
        }),
    })

    constructor(req) {
        const file = req.files['file'] ? req.files['file'][0] : null

        this.data = {
            name: req.body.name,
            email: req.body.email,
            gender: req.body.gender,
            country_code: req.body.country_code,
            country_unicode: req.body.country_unicode,
            phone: req.body.phone,
            address: req.body.address,
            postal_code: req.body.postal_code,
            city: req.body.city,
            country: req.body.country,
            emirate: req.body.emirate,
            role_id: req.body.role_id,
            file: file,
            user_id: req.body.user_id,
        }
    }

    async validate() {
        const { error, value } = AddUserRequest.schema.validate(this.data, {
            abortEarly: false,
        })
        /**
         * Check email exist or not
         */
        const checkEmailExists =
            await AddUserRequest.userRepo.getUserByEmail(
                this.data.email,
            )

        /**
         * check phone exist or not
         */
        const checkPhoneExists =
            await AddUserRequest.userRepo.getUserByPhone(
                this.data.phone,
            )

        /**
         * check userId exist or not
         */
        const checkUserIdExists =
            await AddUserRequest.userRepo.getUserByUserId(
                this.data.user_id,
            )

        /**
         * check role exist or not
         */
        const checkRoleExists =
            this.data.role_id &&
            this.data.role_id != 'undefined' &&
            (await AddUserRequest.roleRepo.getRoleById(this.data.role_id))

        if (
            error ||
            checkEmailExists ||
            checkRoleExists == null ||
            checkPhoneExists !== null ||
            checkUserIdExists !== null
        ) {
            const validationErrors = {}
            error
                ? error.details.forEach((err) => {
                      validationErrors[err.context.key] = err.message
                  })
                : []
            if (checkRoleExists == null) {
                validationErrors['role'] =
                    'Please specify the role of the user.'
            }
            if (checkEmailExists !== null) {
                validationErrors['email'] =
                    'Email id is already taken. Try another one.'
            }
            if (checkPhoneExists !== null) {
                validationErrors['phone'] =
                    'Phone number is already taken. Try another one.'
            }
            if (checkUserIdExists) {
                validationErrors['user_id'] =
                    'User with this id is exist. Try another one.'
            }
            throw validationErrors
        }
        return value
    }
}

export default AddUserRequest
