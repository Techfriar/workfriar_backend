import mongoose from 'mongoose';
import Role from '../models/role.js'; // Replace with your Role model's path
import User from '../models/user.js'; // Replace with your User model's path


// Connect to MongoDB (you should replace the connection string with your actual MongoDB URI)
// mongoose.connect('mongodb://localhost:27017/workfriar', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log('Database connected'))
//   .catch((err) => console.error('Error connecting to the database:', err));

/**
 * Add a user to a role by their IDs.
 * @param {String} roleId - The ID of the role.
 * @param {String} userId - The ID of the user.
 */
const addUserToRole = async (roleId, userId) => {
    try {
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(roleId) || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid roleId or userId');
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Find the role by its ID
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        // Check if the user is already assigned to the role
        if (role.users.includes(userId)) {

            return;
        }

        // Add the user to the role's users array
        role.users.push(userId);

        // Save the updated role
        await role.save();

        process.exit();  // Exit after seeding is done

    } catch (error) {
        console.error('Error adding user to role:', error.message);
        process.exit(1);  // Exit after seeding is done

    }
};
// Example Role ID and User ID
const roleId = '674d7882d16f166e7fc2979f'; // Replace with actual Role ID
const userId = '6744a7c9707ecbeea1efd14c'; // Replace with actual User ID

addUserToRole(roleId, userId);

// addUserToRole('674d7882d16f166e7fc2979f', '6744a7c9707ecbeea1efd14c')
