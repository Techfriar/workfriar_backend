import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';  // Adjust the path to your User model file

// Connect to MongoDB (you should replace the connection string with your actual MongoDB URI)
mongoose.connect('mongodb+srv://snehaanil03:workfriar@cluster0.ts84e.mongodb.net/workfriar?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Database connected'))
  .catch((err) => console.error('Error connecting to the database:', err));

// Function to hash password before saving a user
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Seed data for users
const seedUsers = async () => {
    try {
        // Check if there are existing users to avoid duplication
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('Users already exist. Skipping seeding...');
            return;
        }

        // Create sample users
        const users = [
            {
                full_name: 'John Doe',
                email: 'john.doe@example.com',
                location: 'New York',
                isAdmin: true,  // Admin user
                profile_pic: 'https://example.com/images/john-doe.jpg',
                password: 'password123'  // Plain password (will be hashed)
            },
            {
                full_name: 'Jane Smith',
                email: 'jane.smith@example.com',
                location: 'California',
                isAdmin: false,  // Regular user
                profile_pic: 'https://example.com/images/jane-smith.jpg',
                password: 'password456'  // Plain password (will be hashed)
            },
            {
                full_name: 'Robert Johnson',
                email: 'robert.johnson@example.com',
                location: 'Texas',
                isAdmin: false,  // Regular user
                profile_pic: null,  // No profile picture
                password: 'password789'  // Plain password (will be hashed)
            },
            {
                full_name: 'Alice Green',
                email: 'alice.green@example.com',
                location: 'Florida',
                isAdmin: false,  // Regular user
                profile_pic: 'https://example.com/images/alice-green.jpg',
                password: 'password123'  // Plain password (will be hashed)
            },
        ];

        // Loop through the users and save them to the database
        for (const user of users) {
            user.password = await hashPassword(user.password);  // Hash password before saving

            const newUser = new User(user);
            await newUser.save();  // Save user to the database
        }

        console.log('Users seeded successfully!');
        process.exit();  // Exit after seeding is done
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);  // Exit with error if something goes wrong
    }
};

// Run the seeding function
seedUsers();
