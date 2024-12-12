import mongoose from "mongoose";

const subscriptionIconSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: Buffer,
      required: true,
    },
    content_type: {
      type: String,
      required: true,
    },
    display_name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionIconSchema.statics.normalizeSubscriptionName = function (name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const SubscriptionIcon = mongoose.model(
  "SubscriptionIcon",
  subscriptionIconSchema
);

export default SubscriptionIcon;
