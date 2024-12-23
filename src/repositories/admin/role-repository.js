import Role from "../../models/role.js";
export default class RoleRepository {
  /**
   * Create a new role
   * @param {Object} role - The role object to create
   * @returns {Promise<Role>} - The created role
   */

  static async createRole(role) {
    try {
      const newRole = new Role(role);
      const savedRole = await newRole.save();
      return savedRole;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a role by ID
   * @param {String} id - The ID of the role to retrieve
   * @returns {Promise<Role>} - The retrieved role
   */
  static async getRoleById(id) {
    try {
      const role = await Role.findById(id);
      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all roles
   * @returns {Promise<Role[]>} - The retrieved roles
   */
  static async getAllRoles() {
    try {
      const roles = await Role.find();
      return roles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a role by name and department
   * @param {String} roleName - The name of the role to retrieve
   * @param {String} department - The department of the role to retrieve
   * @returns {Promise<Role>} - The retrieved role
   */
  static async getRoleByNameAndDepartment(roleName, department) {
    try {
      const role = await Role.findOne({
        role: { $regex: new RegExp(`^${roleName}$`, "i") },
        department: { $regex: new RegExp(`^${department}$`, "i") },
      });
      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a role by name
   * @param {String} roleName - The name of the role to retrieve
   * @returns {Promise<Role>} - The retrieved role
   */
  static async getRoleByName(roleName) {
    try {
      const role = await Role.findOne({ role: roleName });
      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a role by ID
   * @param {String} id - The ID of the role to update
   * @param {Object} role - The updated role object
   * @returns {Promise<Role>} - The updated role
   */
  static async updateRole(id, role) {
    try {
      const updatedRole = await Role.findByIdAndUpdate(id, role, { new: true });
      return updatedRole;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Delete a role by ID
   * @param {String} id - The ID of the role to delete
   * @returns {Promise<Role>} - The deleted role
   */
  static async deleteRole(id) {
    try {
      const deletedRole = await Role.findByIdAndDelete(id);
      console.log(id);
      return deletedRole;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add permissions to a role
   * @param {String} roleId - The ID of the role to add permissions to
   * @param {String[]} permissionIds - The IDs of the permissions to add
   * @returns {Promise<Role>} - The updated role
   */
  static async addPermissionsToRole(roleId, permissionIds) {
    try {
      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        { $addToSet: { permissions: { $each: permissionIds } } },
        { new: true, runValidators: true }
      );

      if (!updatedRole) {
        throw new Error("Role not found");
      }

      return updatedRole;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add users to a role
   * @param {String} roleId - The ID of the role to add users to
   * @param {String[]} userIds - The IDs of the users to add
   * @returns {Promise<Role>} - The updated role
   */
  static async addUsersToRole(roleId, userIds) {
    try {
      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        { $addToSet: { users: { $each: userIds } } },
        { new: true, runValidators: true }
      );
      if (!updatedRole) {
        throw new Error("Role not found");
      }

      return { status: true, data: updatedRole };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove User from a role
   * @param {String} roleId - The ID of the role to remove the user from
   * @param {String} userId - The ID of the user to remove
   * @returns {Promise<Role>} - The updated role
   */
  static async removeUserFromRole(roleId, userId) {
    try {
      return await Role.findByIdAndUpdate(
        roleId,
        { $pull: { users: userId } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove User From all roles
   * @param {String} userId - The ID of the user to remove from all roles
   * @returns {Promise<Role>} - The updated roles
   */
  static async removeUserFromAllRoles(userId) {
    try {
      const updatedRoles = await Role.updateMany(
        { users: userId },
        { $pull: { users: userId } }
      );
      return updatedRoles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get role by userId
   * @param {String} userId - The ID of the user to retrieve the role for
   * @returns {Promise<Role>} - The retrieved role
   */
  static async getRoleByUserId(userId) {
    try {
      const role = await Role.findOne({ users: userId });
      return role;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get Team Leads
   * @returns {Promise<Role>} - The retrieved roles
   */
  static async getTeamLeads(skip, limit) {
    try {
      const role = await Role.find({ role: "Team Lead" })
        .populate({
          path: "users",
          select: "full_name _id",
        })
        .skip(skip)
        .limit(limit)
        .lean();
      return role.map((role) => role.users).flat();
    } catch (error) {}
  }

  static async getManagers() {
    try {
      const role = await Role.find({ department: "Management" })
        .populate({
          path: "users",
          select: "full_name _id",
        })
        .lean();
      return role.map((role) => role.users).flat();
    } catch (error) {}
  }
}
