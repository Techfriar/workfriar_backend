import User from '../models/user.js'
import Role from '../models/role.js';

export default class UserRepository {

    /**
     * Fetch all users
     * @return Array<User> users
     */
    async getAllUsers(skip=0, limit=null, department=null) {
        try {
        
        // Fetch all users from the database
             
        // Construct the query object

        let query = {};
        if (department) {
            query = { 
                "roles.department": { 
                    $regex: new RegExp(department, 'i') 
                } 
            };
        }
            const aggregationPipeline = [
                {
                    $lookup: {
                        from: 'roles',
                        localField: '_id',
                        foreignField: 'users',
                        as: 'roles',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'reporting_manager',
                        foreignField: '_id',
                        as: 'reporting_manager',
                    },
                },
                {
                    $unwind: {
                        path: '$roles',
                        preserveNullAndEmptyArrays: false,
                    },
                },
                {  
                    $unwind: {
                        path: '$reporting_manager',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $match: query,
                },
                {
                    $group: {
                        _id: '$_id',
                        full_name: { $first: '$full_name' },
                        email: { $first: '$email' },
                        location: { $first: '$location' },
                        isAdmin: { $first: '$isAdmin' },
                        profile_pic: { $first: '$profile_pic' },
                        status: { $first: '$status' },
                        reporting_manager: { $first: '$reporting_manager' },
                        roles: { $push: '$roles' },
                    },
                },
                {
                    $sort: {
                        full_name: 1,
                    },
                },
                {
                    $skip: skip,
                },
            ];
    
            // Only add the $limit stage if a limit is provided
            if (limit !== null) {
                aggregationPipeline.push({ $limit: limit });
            }

            // Fetch users from the database with filtering and population
            const users = await User.aggregate(aggregationPipeline);
            
            return users;
        } catch (error) {            
            throw new Error("Failed to fetch users");
        }
    }
//Getting roles for a user based on department
    async getRoles(department) {
        const dept = ['Management'];
        dept.push(department);
        if (department === 'Technical') {
            dept.push('Operations');
        }
        try {
            const roles = await Role.find({ department: { $in: dept } }).populate({path:'users',select:'full_name'});
            return { status: true, data: roles };
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch roles');
        }
    }

    async  checkPermission(roleName) {
        try {
            const role = await Role.findOne({ _id: roleName }).populate('permissions');
    
            if (!role) {
                return { status: false, message: 'Role not found' };
            }
    
            const hasUserCategory = role.permissions.some(permission => permission.category === 'Users');
    
            const isAdmin = hasUserCategory;
    
            return { status: true, isAdmin };
        } catch (error) {
            throw new Error(error.message || 'Failed to check permissions');
        }
    }

//adding an  employee to the database
async addEmployees(name,email,reporting_manager,phone_number,isAdmin,location,isactive,fileurl) {
    try {
        const employee = new User({
            full_name: name,
            email,
            reporting_manager,
            phone_number,
            location,
            status:isactive,
            profile_pic: fileurl,
            isAdmin,
        });
        const savedEmployee = await employee.save();
        return { status: true, data: savedEmployee };
    } catch (error) {
        return { status: false, error: error.message };
    }
}

async  updateEmployee(id, updateData) {
    try {
     
        const updatedEmployee = await User.findByIdAndUpdate(id, updateData, {
            new: true, 
            runValidators: true, 
        });

        if (!updatedEmployee) {
            return null;
        }
        return {status:true,data:updatedEmployee};
    } catch (error) {
        throw new Error(`Error updating employee: ${error.message}`);
    }
}
    
    /**
     * Get Count of all users in a department if depertment provided else count all users
     * @param {String} department - The department to filter users by
     * @returns {Promise<number>}
     */
    async countAllUsers(department) {
        try {    
            const pipeline = [
                {
                    $lookup: {
                        from: 'roles',
                        localField: '_id',
                        foreignField: 'users',
                        as: 'roles',
                    },
                },
                {
                    $match: department ? { 'roles.department': department } : {},
                },
                {
                    $count: 'count',
                },
            ];
    
            const result = await User.aggregate(pipeline);

            return result[0]?.count || 0;
        } catch (error) {
            throw new Error(`Failed to count users: ${error.message}`);
        }
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
