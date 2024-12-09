import User from '../models/user.js'
import Role from '../models/role.js';

export default class UserRepository {

    /**
     * Fetch all users
     * @return Array<User> users
     */
    async getAllUsers(skip, limit) {
        try {
            // Fetch all users from the database
            const users = await User.find()
                .populate('roles')
                .populate({
                    path: 'reporting_manager', // Populate reporting_manager
                    select: 'full_name' // Select specific fields to include
                })
                .skip(skip)
                .limit(limit); // Populate roles if needed
            return users;
        } catch (error) {
            throw new Error("Failed to fetch users");
        }
    }

    /**
     * Get Count of all users
     * @returns {Promise<number>}
     */
    async countAllUsers() {
        return User.countDocuments();
    }

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
     * Get user by ID with expanded roles (including department field)
     * @param {String} userId - The ID of the user
     * @return {Promise<Object>} - The user with populated roles and their department
     */
    async getUserExpanded(userId) {
        try {
            return await User.findOne({ _id: userId })
                .populate({
                    path: 'roles',
                    select: 'role department', // Include only the required fields
                })
                .populate({
                    path: 'reporting_manager',
                    select: 'full_name', // Fetch only the manager's name
                })
                .lean();
        } catch (error) {
            throw new Error(`Unable to fetch user: ${error.message}`);
        }
    }

    /**
     * Delete user by id
     * @param {String} userId - The ID of the user to delete
     * @return {Promise<User>} - The deleted user object
     */
    async deleteUser(userId) {
        try {
            const deletedUser = await User.findByIdAndDelete(userId);
            return deletedUser;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
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
