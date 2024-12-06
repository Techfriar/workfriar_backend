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
    justOne: true,
    options: { select: '_id' },
});

PermissionSchema.set('toObject', { virtuals: true });
PermissionSchema.set('toJSON', { virtuals: true });

const Permission = mongoose.model('Permission', PermissionSchema)

export default Permission