import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
    client_name: {
        type: String,
        required: true,
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'country',
        required: true,
    },
    client_manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    billing_currency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'currency',
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Inactive']
    }
})

const client = mongoose.model('client',clientSchema);
export default client;