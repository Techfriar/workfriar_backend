import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';  // Adjust the path to your User model file

// Connect to MongoDB (you should replace the connection string with your actual MongoDB URI)
mongoose.connect('mongodb://localhost:27017/workfriar', {
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
    // Check if the users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const usersCollectionExists = collections.some(
      (collection) => collection.name === "users"
    );

    // If users collection doesn't exist, create and seed it
    if (!usersCollectionExists) {
      console.log("Users collection does not exist. Creating and seeding...");

      // Create sample users
      const users = [
        {
          full_name: "John Doe",
          email: "john.doe@example.com",
          location: "Dubai",
          isAdmin: true,
          profile_pic: "https://example.com/images/john-doe.jpg",
          password: "password123",
        },
        {
          full_name: "Jane Smith",
          email: "jane.smith@example.com",
          location: "Kochi",
          isAdmin: false,
          profile_pic: "https://example.com/images/jane-smith.jpg",
          password: "password456",
        },
        {
          full_name: "Robert Johnson",
          email: "robert.johnson@example.com",
          location: "Kochi",
          isAdmin: false,
          profile_pic: null,
          password: "password789",
        },
        {
          full_name: "Alice Green",
          email: "alice.green@example.com",
          location: "Kochi",
          isAdmin: false,
          profile_pic: "https://example.com/images/alice-green.jpg",
          password: "password123",
        },
      ];

      // Loop through the users and save them to the database
      for (const user of users) {
        user.password = await hashPassword(user.password);

        const newUser = new User(user);
        await newUser.save();
      }

      console.log("Users collection created and seeded successfully!");
    } else {
      console.log("Users collection already exists. Skipping seeding.");
    }
  } catch (err) {
    console.error("Error seeding users:", err);
    throw err; // Rethrow to be handled by the caller
  }
};

export default seedUsers;