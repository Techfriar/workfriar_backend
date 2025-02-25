import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';  // Adjust the path to your User model file
import Role from '../models/role.js'; // Adjust the path
import Permission from '../models/permission.js'; // Adjust the path

// Function to hash password before saving a user
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedSuperAdmin = async () => {
  try {
    // Check if 'Super Admin' role already exists
    const existingRole = await Role.findOne({ role: 'Super Admin' });
    if (existingRole) {
      return;
    }

    // Clear existing data
    await Role.deleteMany({});
    await Permission.deleteMany({});
    await User.deleteMany({});

    // Seed permissions
    const permissions = [
      { category: 'Timesheet', actions: ['view', 'edit', 'delete', 'review'] },
      { category: 'Users', actions: ['view', 'edit', 'review', 'delete'] },
      { category: 'Projects', actions: ['view', 'edit', 'review', 'delete'] },
      { category: 'Task Category', actions: ['view', 'edit', 'review', 'delete'] },
      { category: 'Project Team', actions: ['view', 'edit', 'review', 'delete'] },
      { category: 'Clients', actions: ['view', 'edit', 'review', 'delete'] },
      { category: 'Users', actions: ['view', 'edit', 'review', 'delete'] },
      { category: 'Project Forecast', actions: ['view', 'edit', 'review', 'delete'] },
    ];

    const permissionDocs = await Permission.insertMany(permissions);

    // Seed roles
    const roles = [
      {
        role: 'Super Admin',
        department: 'Management',
        permissions: permissionDocs.map((p) => p._id), // Associate permissions
        status: true,
      }
    ];

    const roleDocs = await Role.insertMany(roles);
    console.log('Roles seeded:', roleDocs);

    // Create Super Admin user
    const superAdmin = new User({
      full_name: 'Super Admin',
      email: 'info@workfriar.com',
      phone_number: '872312431235',
      location: 'India',
      isAdmin: true,
    });

    const savedUser = await superAdmin.save();
    console.log('Super Admin user created:', savedUser);

    // Add user to role
    await Role.findByIdAndUpdate(roleDocs[0]._id, { $push: { users: savedUser._id } });
    console.log('User added to Super Admin');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1); // Exit with error
  }
};

// Run the seeder
export default seedSuperAdmin
