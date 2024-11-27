import mongoose from "mongoose";

/**
 * Define the project schema
 */
const projectSchema = mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    plannedStartDate: {
      type: String,
    },
    plannedEndDate: {
      type: String,
    },
    actualStartDate: {
      type: String,
    },
    actualEndDate: {
      type: String,
    },
    projectLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    billingModel: {
      type: String,
    },
    projectLogo: {
      type: String,
    },
    openForTimeEntry: {
      type: String,
      required: true,
      enum: ["opened", "closed"],
      default: "closed",
    },
    status: {
      type: String,
      required: true,
      enum: ["Not Started", "In Progress", "Completed", "On Hold", "Cancelled"],
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
