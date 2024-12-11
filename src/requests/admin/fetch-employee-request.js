import Joi from 'joi';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import UserRepository from '../../repositories/user-repository.js';

export default class FectUserDetailRequest {

	static UserRepo = new UserRepository()
    
    static async validateUserId(id) {
        try {
            const user = await this.UserRepo.getUserExpanded(id)
            if (!user) throw new CustomValidationError('User not found');

            return user
        } catch (error) {
            throw new CustomValidationError(error.message)
        }
    }

}
