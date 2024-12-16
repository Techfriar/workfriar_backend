import mongoose from "mongoose";

const iconSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    iconUrl: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Icon = mongoose.model("Icon", iconSchema);

export default Icon;
