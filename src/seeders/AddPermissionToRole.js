import mongoose from 'mongoose';
import Role from '../models/role.js'; // Replace with your Role model's path
import Permission from '../models/permission.js'; // Replace with your Permission model's path


// Connect to MongoDB (you should replace the connection string with your actual MongoDB URI)
// mongoose.connect('mongodb://localhost:27017/workfriar', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log('Database connected'))
//   .catch((err) => console.error('Error connecting to the database:', err));

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

            return;
        }

        // Add the permission to the role's permissions array
        role.permissions.push(permissionId);

        // Save the updated role
        await role.save();

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
