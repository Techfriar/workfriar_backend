import mongoose from "mongoose";

/**
 * Define the project schema
 */
const projectSchema = mongoose.Schema(
  {
    client_name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
      required: true,
    },
    project_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    planned_start_date: {
      type: String,
    },
    planned_end_date: {
      type: String,
    },
    actual_start_date: {
      type: String,
    },
    actual_end_date: {
      type: String,
    },
    project_lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    billing_model: {
      type: String,
      enum: [
        "Bill time (time and materials)",
        "Bill milestones / Fixed fee",
        "Retainer",
        "Non billable",
      ],
    },
    project_logo: {
      type: String,
    },
    open_for_time_entry: {
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
    effective_close_date: {
      type: Date,
      default: null,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual for roles
projectSchema.virtual("team", {
  ref: "Project Team", // Name of the Role model
  localField: "_id", // Field in the user schema
  foreignField: "project", // Field in the Role schema
  justOne: true, // Set to true if a single role per user; false for an array
  options: { select: "team_members" }, // Default fields to include during population
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
