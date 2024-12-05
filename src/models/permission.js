import mongoose from "mongoose"

const Schema = mongoose.Schema

const PermissionSchema = new Schema({
    category: {
        type: String,
        required: true,
    },
    actions: [{
        type: String,
        enum: ["view", "edit", "review", "delete"],
        default: "view"
    }]
})

PermissionSchema.virtual('role', {
    ref: 'Role',
    localField: '_id',
    foreignField: 'permissions',
    justOne: false,
    options: { select: '_id' },
});

const Permission = mongoose.model('Permission', PermissionSchema)

export default Permission