import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
    client_name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    client_manager: {
        type: String,
        required: true,
    },
    billing_currency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Not started','In progress','On hold','Cancelled']
    }
})

const client = mongoose.model('client',clientSchema);
export default client;