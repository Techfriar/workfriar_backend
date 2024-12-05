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
}