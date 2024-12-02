import { types } from "joi"
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

const Permission = mongoose.model()