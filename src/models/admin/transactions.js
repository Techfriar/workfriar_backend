import mongoose from "mongoose";

/**
 * Define the transaction schema
 */

const transactionSchema = mongoose.Schema({
    transaction_date: {
        type: Date,
        required: true,
    },
    subscription_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
        required: true,
    },
    description:{
        type: String,
    },
    amount:{
        type: String,
        required: true,
    },
    payment_method:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Subscription",
        required: true,
    },
    card_provider:{
        type: String,
    },
    card_holder_name:{
        type: String
    },
    last_four_digits:{
        type: String,
    },
    card_expiry:{
        type: String,
    },
    license_count:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Subscription",
        required: true,
    },
    next_due_date:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Subscription",
        required: true,
    },
    deleted_at: {
        type: Date,
        default: null
    },
    is_deleted: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
})

// Add a query middleware to exclude soft deleted records by default
transactionSchema.pre('find', function() {
    this.where({ is_deleted: false });
});

transactionSchema.pre('findOne', function() {
    this.where({ is_deleted: false });
});

transactionSchema.pre('findById', function() {
    this.where({ is_deleted: false });
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;