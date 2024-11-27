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
        status: {
            type: Boolean,
            default: true, // Assign default value
        },
        reporting_manager: {
            type: mongoose.Schema.Types.ObjectId, // Reference to another user
            ref: 'User',
            required: false
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
    justOne: false, // Set to true if a single role per user; false for an array
    options: { select: 'role department _id' }, // Default fields to include during population
});

// Virtual for Notifications
userSchema.virtual('notifications', {
    ref: 'Notification', // Name of the Notification model
    localField: '_id',   // Field in the User schema
    foreignField: 'user_id', // Field in the Notification schema that links to User
});
  
// Virtual for Team
userSchema.virtual('team', {
    ref: 'Team',       // Name of the Team model
    localField: '_id', // Field in the User schema
    foreignField: 'members', // Field in the Team schema that contains user IDs
});

// Virtual for Timesheet
userSchema.virtual('timesheets', {
    ref: 'Timesheet', // Name of the Timesheet model
    localField: '_id',
    foreignField: 'user_id', // Field in the Timesheet schema that links to User
});
  
// Virtual for Projects (as Lead)
userSchema.virtual('leading_projects', {
    ref: 'Project',    // Name of the Project model
    localField: '_id', // Field in the User schema
    foreignField: 'project_lead', // Field in the Project schema that links to User
});

// Virtual for Project Forecasts (as Lead)
userSchema.virtual('leading_projects_forecasts', {
    ref: 'ProjectForecast', // Name of the ProjectForecast model
    localField: '_id',      // Field in the User schema
    foreignField: 'team_lead',   // Field in the ProjectForecast schema that links to User
});

// Virtual for Project Forecasts (as team member)
userSchema.virtual('team_projects_forecasts', {
    ref: 'ProjectForecast', // Name of the ProjectForecast model
    localField: '_id',      // Field in the User schema
    foreignField: 'team_member_id',   // Field in the ProjectForecast schema that links to User
});

//compare the hashed password with the password that the user sends in the request.

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
userSchema.plugin(mongoosePaginate)
const User = mongoose.model('User', userSchema)

export default User
