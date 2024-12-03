import mongoose from 'mongoose';
import Role from '../models/role.js'; // Adjust the path
import Permission from '../models/permission.js'; // Adjust the path

const seedData = async () => {
    try {
        // Connect to MongoDB (adjust URI as needed)
        await mongoose.connect('mongodb://localhost:27017/workfriar', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully!');

        // Clear existing data
        await Role.deleteMany({});
        await Permission.deleteMany({});
        console.log('Existing data cleared!');

        // Seed permissions
        const permissions = [
            { category: 'Timesheet', actions: ['view', 'edit', 'delete'] },
            { category: 'Users', actions: ['view', 'edit', 'review'] },
            { category: 'Projects', actions: ['view', 'edit', 'review', 'delete'] },
        ];

        const permissionDocs = await Permission.insertMany(permissions);
        console.log('Permissions seeded:', permissionDocs);

        // Seed roles
        const roles = [
            {
                role: 'CEO',
                department: 'Management',
                permissions: permissionDocs.map((p) => p._id), // Associate permissions
                status: true,
            },
            {
                role: 'Team-lead',
                department: 'Technical',
                permissions: [permissionDocs[0]._id], // Only Timesheet Management permissions
                status: true,
            },
            {
                role: 'HR-manager',
                department: 'General',
                permissions: [permissionDocs[1]._id], // Only User Management permissions
                status: true,
            },
        ];

        const roleDocs = await Role.insertMany(roles);
        console.log('Roles seeded:', roleDocs);

        // Disconnect from database
        await mongoose.disconnect();
        console.log('Database disconnected!');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1); // Exit with error
    }
};

// Run the seeder
seedData();
