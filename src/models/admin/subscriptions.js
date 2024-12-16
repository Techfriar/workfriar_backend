import mongoose from "mongoose";

/**
 * Define the subscription schema
 */
const subscriptionSchema = mongoose.Schema(
  {
    subscription_name: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    license_count: {
      type: String,
      required: true,
    },
    cost: {
      type: String,
      required: true,
    },
    billing_cycle: {
      type: String,
      required: true,
      enum: [
        "Monthly",
        "Quarterly",
        "Annually",
        "Pay As You Go",
        "One Time Payment",
      ],
    },
    next_due_date: {
      type: Date,
    },
    currency: {
      type: String,
      required: true,
      default: "USD",
    },
    payment_method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Pending", "Expired"],
      default: "Active",
    },
    type: {
      type: String,
      required: true,
      enum: ["Common", "Project Specific"],
      default: "Common"
    },
    project_names: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    }],
  },
  {
    timestamps: true,
  }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;