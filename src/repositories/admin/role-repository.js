import Role from "../../models/role.js";
export default class RoleRepository{
    static async createRole(role){
        try{
            const newRole = new Role(role);
            const savedRole = await newRole.save();
            return savedRole;
        }catch(error){
            throw error;
        }
    }
    static async getRoleById(id){
        try{
            const role = await Role.findById(id);
            return role;
        }catch(error){
            throw error;
        }
    }
    static async getAllRoles(){
        try{
            const roles = await Role.find();
            return roles;
        }catch(error){
            throw error;
        }
    }

    static async getRoleByNameAndDepartment(roleName, department){
        try{
            const role = await Role.findOne({ 
                role: { $regex: new RegExp(`^${roleName}$`, 'i') },
                department: { $regex: new RegExp(`^${department}$`, 'i') }
            });
            return role;
        }catch(error){
            throw error;
        }
    }

    static async getRoleByName(roleName){
        try{
            const role = await Role.findOne({ role: roleName });
            return role;
        }catch(error){
            throw error;
        }
    }

    static async updateRole(id, role){
        try{
            const updatedRole = await Role.findByIdAndUpdate(id, role, { new: true });
            return updatedRole;
        }catch(error){
            throw error;
        }
    }
    static async deleteRole(id){
        try{
            const deletedRole = await Role.findByIdAndDelete(id);
            return deletedRole;
        }catch(error){
            throw error;
        }
    }

    static async addPermissionsToRole(roleId, permissionIds) {
        try {
            const updatedRole = await Role.findByIdAndUpdate(
                roleId,
                { $addToSet: { permissions: { $each: permissionIds } } },
                { new: true, runValidators: true }
            );

            if (!updatedRole) {
                throw new Error('Role not found');
            }

            return updatedRole;
        } catch (error) {
            throw error;
        }
    }

    // Add users to a role
    static async addUsersToRole(roleId, userIds) {
        try {
            const updatedRole = await Role.findByIdAndUpdate(
                roleId,
                { $addToSet: { users: { $each: userIds } } },
                { new: true, runValidators: true }
            );

            if (!updatedRole) {
                throw new Error('Role not found');
            }

            return updatedRole;
        } catch (error) {
            throw error;
        }
    }

}