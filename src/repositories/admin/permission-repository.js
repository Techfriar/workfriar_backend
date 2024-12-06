import Permission from '../../models/permission.js';
export default  class PermissionRepository {
   
    /**
     * Create a new permission
     *
     * @param {Object} permission - The permission object to create
     * @returns {Promise<Object>} The created permission
     */
    static async createPermission(permission) {
        try {
            const newPermission = new Permission(permission);
            const savedPermission = await newPermission.save();
            return savedPermission;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find a permission by category and update it, or create a new one if it doesn't exist
     * 
     * @param {string} category - The category of the permission
     * @param {string[]} actions - The actions for the permission
     * @param {string} roleId - The ID of the role associated with the permission
     * @returns {Promise<Object>} The updated or newly created permission
     */
    static async findOneAndUpdatePermission(category, actions, roleId) {
        try {
            const permission = await Permission.findOneAndUpdate(
                { category, role: roleId  },
                { $set: { actions } },
                { upsert: true, new: true }
            );

            return permission;
        } catch (error) {
            console.error('Error in findOneAndUpdatePermission:', error);
            throw error;
        }
    }

    /**
     * Find all permissions by category and role ID
     * @param {string} category - The category of the permission (optional)
     * @param {string} roleId - The ID of the role associated with the permission 
     * @returns {Promise<Object>} The permission
     *
     */
    static async findPermissionsByRoleId(roleId) {
        try {
            const permissions = await Permission.find().populate({
                path: 'role',
                match: { _id: roleId },
                select: '_id',
            });
            const filterdPermission = permissions.filter(per => per.role)
            return filterdPermission;
        } catch (error) {
            throw error;
        }
    }
}