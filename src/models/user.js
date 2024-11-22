import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import mongoosePaginate from 'mongoose-paginate'

/**
 * Define the user schema
 */
const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        country_code: {
            type: String,
            required: true,
        },
        country_unicode: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true, 
        },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        },
        status: {
            type: Boolean,
            default: true,
            required: true,
        },
        profile_pic_path: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
)

//compare the hashed password with the password that the user sends in the request.

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.plugin(mongoosePaginate)
const User = mongoose.model('User', userSchema)

export default User
