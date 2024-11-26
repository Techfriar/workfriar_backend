import mongoose from 'mongoose'

/**
 * Function to connect to the MongoDB database
 */
const connectDB = async () => {
    try {0
        const conn = await mongoose.connect(process.env.MONGO_URI)
        
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

export default connectDB
