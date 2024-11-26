import mongoose from 'mongoose'
// import databaseMigration from '../migrations/databaseMigration.js'

const connectDB = async () => {
    try {
        // Attempt to establish a connection to the MongoDB database using the MONGO_URI from the environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI)

        // Call the databaseMigration function to populate the database with initial data (optional)
        // databaseMigration()
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
