import mongoose from "mongoose";

/**
 * Define the holiday schema
 */
const holidaySchema = mongoose.Schema(
  {
    holiday_name: {
      type: String,
      required: true,
    },
    holiday_type: {
      type: String,
      required: true,
      enum: ["National Holiday", "Public Holiday", "Restricted Holiday", "Office Shutdown"],
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    location: [{
      type: String,
      required: true,
      enum: ["India", "Dubai"],
    }],
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
