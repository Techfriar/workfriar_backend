export default class RoleResponse {
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
}