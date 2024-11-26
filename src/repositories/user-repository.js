import User from '../models/user.js'

export default class UserRepository {

    /**
     * Get user by email
     * @param String email
     * @return User user
     */
    async getUserByEmail(email) {
        return User.findOne({ email: email })
    }

    /**
     * Get user by id
     * @param String userId
     * @return User user
     */
    async getUserById(userId) {
        return await User.findOne({ _id: userId })
    }
    /**
     * Check the email is existing or not
     * @param String email
     * @param String userId
     * @return User user
     */
    async checkEmailExist(email, userId) {
        const user = await User.findOne({
            email: email,
            _id: { $ne: userId },
        })
        return user
    }

    /**
     * Get user by phone
     * @param {string} phone - user phone number
     * @return {User}
     */
    async getUserByPhone(phone) {
        return User.findOne({ phone: phone })
    }

    /**
     * Check phone number exists 
     * @param {string} phone - user phone number
     * @param {string} userId - userId
     * @return {User}
     */
    async checkPhoneNumberExists(phone, userId) {
        const user = await User.findOne({
            phone: phone,
            _id: { $ne: userId },
        })
        return user
    }

    /**
     * Update user profile
     * @param {Object} customerData - The updated user data
     * @return {Promise<User>} - The updated user object
     */
    async updateUserProfile(customerData) {
        const userId = customerData._id
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            customerData,
            { new: true },
        )

        return updatedUser
    }

     /**
     * Check if a user exists by email and is an admin.
     * @param {string} email - The user's email address.
     * @returns {Promise<boolean>} - Returns true if the user exists and is an admin, otherwise false.
     */
     async isAdminByEmail(email) {
        try {
            const user = await User.findOne({ email }).exec();
            return user ? user.isAdmin : false;
        } catch (error) {
            throw new Error('Error checking user admin status');
        }
    }
}
