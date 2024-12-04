import Permission from '../../models/permission.js';
export default  class PermissionRepository {
   
    static async createPermission(permission) {
        try {
            const newPermission = new Permission(permission);
            const savedPermission = await newPermission.save();
            return savedPermission;
        } catch (error) {
            throw error;
        }
    }

    static async getPermissionByCategory(category) {
        try {
            const permission = await Permission.findOne({ category });
            return permission;
        } catch (error) {
            throw error;
        }
    }
}