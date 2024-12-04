import mongoose from 'mongoose';
import Role from '../models/role.js'; // Replace with your Role model's path
import Permission from '../models/permission.js'; // Replace with your Permission model's path


/**
 * Add a permission to a role by their IDs.
 * @param {String} roleId - The ID of the role.
 * @param {String} permissionId - The ID of the permission.
 */
const addPermissionToRole = async (roleId, permissionId) => {
    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(roleId) || !mongoose.Types.ObjectId.isValid(permissionId)) {
            throw new Error('Invalid roleId or permissionId');
        }

        // Check if the permission exists
        const permission = await Permission.findById(permissionId);
        if (!permission) {
            throw new Error('Permission not found');
        }

        // Find the role by its ID
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        // Check if the permission is already assigned to the role
        if (role.permissions.includes(permissionId)) {
            console.log('Permission is already assigned to this role.');
            return;
        }

        // Add the permission to the role's permissions array
        role.permissions.push(permissionId);

        // Save the updated role
        await role.save();
        console.log(`Permission ${permissionId} successfully added to role ${role.role}`);
    } catch (error) {
        console.error('Error adding permission to role:', error.message);
    }
    finally{
        process.exit()
    }
};

// Example Role ID and Permission ID
const roleId = '674d7882d16f166e7fc2979f'; // Replace with actual Role ID
const permissionId = '674d7882d16f166e7fc2979a'; // Replace with actual Permission ID

addPermissionToRole(roleId, permissionId);
