import RoleRepository from '../../repositories/admin/role-repository.js';
import UserRepository from '../../repositories/user-repository.js';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';

export default class RoleRequest {
    static RoleRepo = RoleRepository;
    static UserRepo = new UserRepository();
    
    /**
     * Convert a string to Title Case
     * @param {string} str - The input string
     * @returns {string} - The string in Title Case
     */
     static toTitleCase(str) {
        return str.trim().split(/\s+/).map(word => {
            if (word.length === 2) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    /**
     * Validate the request to create a new role
     * @param {Object} roleData - The data for creating a new role
     * @param {string} roleData.role - The name of the role
     * @param {string} roleData.department - The department of the role
     * @param {Array} roleData.permissions - Array of permission objects
     * @param {boolean} [roleData.status] - The status of the role (optional)
     * @returns {Promise<Object>} - Validated role data
     * @throws {CustomValidationError}
     */
    static async validateCreateRole(roleData) {
        try {
            const { role, department, permissions=[], status } = roleData;

            // Validate role name
            if (!role || typeof role !== 'string' || role.trim() === '') {
                throw new CustomValidationError('Invalid role name');
            }
            this.role = this.toTitleCase(role);
            this.department = this.toTitleCase(department);

            // Check if role with the same name and department already exists
            const existingRole = await this.RoleRepo.getRoleByNameAndDepartment(role.trim(), department);
            if (existingRole) {
                throw new CustomValidationError('A role with this name already exists in the specified department');
            }

            // Validate department
            const validDepartments = ['Management', 'Finance', 'HR', 'Operations', 'Technical'];
            if (!department || !validDepartments.includes(department)) {
                throw new CustomValidationError('Invalid department');
            }

            // Validate permissions
            if (permissions && (!Array.isArray(permissions))) {
                throw new CustomValidationError('Permissions must be a non-empty array');
            }

            const validatedPermissions = await Promise.all(permissions.map(async (perm) => {
                if (!perm.category || !perm.actions || !Array.isArray(perm.actions)) {
                    throw new CustomValidationError('Invalid permission format');
                }

                perm.category = this.toTitleCase(perm.category);
                perm.actions = perm.actions.map(action => action.toLowerCase());

                // If it's a new permission category, ensure it has 'view' action
                if (!perm.actions.includes('view')) {
                    throw new CustomValidationError(`New permission category ${perm.category} must include 'view' action`);
                }

                return perm;
            }));

            // Validate status if provided
            if (status !== undefined && typeof status !== 'boolean') {
                throw new CustomValidationError('Invalid status');
            }

            return {
                role: role.trim(),
                department,
                permissions: validatedPermissions,
                status: status === undefined ? true : status
            };
        } catch (error) {
            throw new CustomValidationError(error.message);
        }
    }

    /**
     * Validate the request to map users to a role
     * @param {string} roleId - The ID of the role
     * @param {string[]} userIds - Array of user IDs to be mapped to the role
     * @returns {Promise<{role: Object, users: Object[]}>}
     * @throws {CustomValidationError}
     */
    static async validateMapUsersToRole(roleData) {
        try {
            const { roleId, userIds } = roleData;
            const role = await this.RoleRepo.getRoleById(roleId);
            if (!role) {
                throw new CustomValidationError('Role not found');
            }

            const userResults = await Promise.all(userIds.map(async userId => {
                const user = await this.UserRepo.getUserById(userId);
                return { userId, user };
            }));

            const invalidUsers = userResults.filter(result => !result.user).map(result => result.userId);

            if (invalidUsers.length > 0) {
                throw new CustomValidationError(`Some users were not found: ${invalidUsers.join(', ')}`);
            }

            return { roleId, userIds };
        } catch (error) {
            throw new CustomValidationError(error.message);
        }
    }

    /**
     * Validate the request to delete a role
     * @param {Object} body - The request body
     * @param {string} body.roleId - The ID of the role to be deleted
     * @returns {Promise<string>} The validated role ID
     * @throws {CustomValidationError} If the role is not found or validation fails
     */
    static async validateDeleteRole(body) {
    
        const { roleId } = body;
        try {
            const role = await this.RoleRepo.getRoleById(roleId);
            if (!role) {
                throw new CustomValidationError('Role not found');
            }

            return role._id;
        } catch (error) {
            throw new CustomValidationError(error.message);
        }
    }
}
