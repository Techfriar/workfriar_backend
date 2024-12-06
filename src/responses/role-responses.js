export default class RoleResponse {
    /**
     * Format the role object
     * @param {Object} role - The role object to format
     * @returns {Object} - The formatted role object
     */
    static async formatRole(role) {
        try {
            const formattedRole = {
                id: role._id,
                role: role.role,
                department: role.department,
                no_of_users: role.users.length,
                status: role.status,
            }; 
            return formattedRole;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Format the Permission object
     * @param {Object} permission - The permission object to format
     * @returns {Object} - The formatted permission object
     */
    static async formatPermission(permission) {
        try {
            const formattedPermission = {
                id: permission._id,
                category: permission.category,
                actions: {
                    view: permission.actions.includes('view'),
                    edit: permission.actions.includes('edit'),
                    review: permission.actions.includes('review'),
                    delete: permission.actions.includes('delete'),
                },
            };
            return formattedPermission;
        } catch (error) {
            throw error;
        }
    }
}