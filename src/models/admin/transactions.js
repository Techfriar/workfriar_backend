import mongoose from "mongoose";

/**
 * Define the transaction schema
 */

const transactionSchema = mongoose.Schema(
  {
    transaction_date: {
      type: Date,
      required: true,
    },
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    description: {
      type: String,
    },
    transaction_currency: {
      type: String,
      required: true,
      default: "USD",
    },
    transaction_amount: {
      type: String,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "Paypal", "Other"],
    },
    card_provider: {
      type: String,
    },
    card_holder_name: {
      type: String,
    },
    last_four_digits: {
      type: String,
    },
    card_expiry: {
      type: String,
    },
    license_count: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    next_due_date: {
      type: Date,
      required: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    receipts: [{
        type: String,
        required: false
    }],
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre("find", function () {
  this.where({ is_deleted: false });
});

transactionSchema.pre("findOne", function () {
  this.where({ is_deleted: false });
});

transactionSchema.pre("findById", function () {
  this.where({ is_deleted: false });
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
