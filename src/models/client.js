import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    clientManager: {
        type: String,
        required: true,
    },
    billingCurrency: {
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