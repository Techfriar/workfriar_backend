import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Define the Role schema
 */
const RoleSchema = new Schema(
    {
        role: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        permissions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Permission', // Reference to Permission model
                default: [],
            },
        ],
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Reference to User model
                default: [],
            },
        ],
        status: {
            type: Boolean,
            default: true, // Set default status to true
        },
    },
    {
        timestamps: true, // Automatically include createdAt and updatedAt fields
    }
);

// Create the Role model
const Role = mongoose.model('Role', RoleSchema);

export default Role;