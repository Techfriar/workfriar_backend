import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import mongoosePaginate from 'mongoose-paginate'

/**
 * Define the user schema
 */
const userSchema = mongoose.Schema(
    {
        full_name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        location: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
            required: true,
        },
        profile_pic: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
)

// Virtual for roles
userSchema.virtual('roles', {
    ref: 'Role', // Name of the Role model
    localField: '_id', // Field in the user schema
    foreignField: 'users', // Field in the Role schema
});

// userSchema
//compare the hashed password with the password that the user sends in the request.

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.plugin(mongoosePaginate)
const User = mongoose.model('User', userSchema)

export default User
