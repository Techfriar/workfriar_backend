import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        // Attempt to establish a connection to the MongoDB database using the MONGO_URI from the environment variables
        const conn = await mongoose.connect(process.env.MONGO_URI)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
