import { CustomValidationError } from '../../exceptions/custom-validation-error.js';
import UserRepository from '../../repositories/user-repository.js';



class NotificationRequest {
    static UserRepo = new UserRepository()

    static async validateUser(user_id) {
        try {
            const user = await this.UserRepo.getUserById(user_id)
            if (!user) throw new CustomValidationError('User not found');
            return { error: false,user}
        }
        catch (error) {
            throw new CustomValidationError(error.message)
        }
    }

}

export default NotificationRequest;
