import RoleRepository from '../../repositories/role-repository.js';
import UserRepository from '../../repositories/user-repository.js';
import { CustomValidationError } from '../../exceptions/custom-validation-error.js';

export default class RoleRequest {
    static RoleRepo = RoleRepository;
    static UserRepo = new UserRepository();

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

                // const existingPerm = await this.PermissionRepo.getPermissionByCategory(perm.category);
                // if (existingPerm) {
                //     // Validate actions
                //     const invalidActions = perm.actions.filter(action => !existingPerm.actions.includes(action));
                //     if (invalidActions.length > 0) {
                //         throw new CustomValidationError(`Invalid actions for category ${perm.category}: ${invalidActions.join(', ')}`);
                //     }
                // } else {
                    
                // }
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
    static async validateMapUsersToRole(roleId, userIds) {
        try {
            const role = await this.RoleRepo.getRoleById(roleId);
            if (!role) {
                throw new CustomValidationError('Role not found');
            }

            const users = await Promise.all(userIds.map(userId => this.UserRepo.getUserById(userId)));
            const invalidUsers = users.filter(user => !user);
            if (invalidUsers.length > 0) {
                throw new CustomValidationError(`Some users were not found: ${invalidUsers.join(', ')}`);
            }

            return { role, users };
        } catch (error) {
            throw new CustomValidationError(error.message);
        }
    }

    /**
     * Validate the request to add a role to a user
     * @param {string} userId - The ID of the user
     * @param {string} roleId - The ID of the role to be added
     * @returns {Promise<{user: Object, role: Object}>}
     * @throws {CustomValidationError}
     */
    }
