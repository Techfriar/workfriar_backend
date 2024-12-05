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
     * @returns {Promise<Object>} The updated or newly created permission
     */
    static async findOneAndUpdatePermission(category, actions) {
        try {
            const permission = await Permission.findOneAndUpdate(
                { category },
                { $set: { actions } },
                { upsert: true, new: true }
            );

            return permission;
        } catch (error) {
            console.error('Error in findOneAndUpdatePermission:', error);
            throw error;
        }
    }
}