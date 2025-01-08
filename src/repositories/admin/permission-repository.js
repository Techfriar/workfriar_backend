import Permission from '../../models/permission.js';
import Role from '../../models/role.js';
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
            const role = await Role.findById(roleId).populate('permissions');
            const permission = role.permissions.find(p => p.category === category);

            if (permission) {
                // Update the actions
                permission.actions = actions;
                await permission.save();
                return permission
            } else {
                // Create a new permission and associate it with the role
                const newPermission = await Permission.create({ category, actions });
                role.permissions.push(newPermission._id);
                await role.save();
                return newPermission;

            }
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