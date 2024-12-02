import mongoose from "mongoose";

const projectStatusReportSchema = mongoose.Schema(
  {
    project_name: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    project_lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planned_start_date: {
      type: Date,
      required: true,
    },
    planned_end_date: {
      type: Date,
      required: true,
    },
    actual_start_date: {
      type: Date,
      required: true,
    },
    actual_end_date: {
      type: Date,
    },
    reporting_period: {
      type: Date,
      required: true,
    },
    progress: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
    },
    accomplishments: {
      type: String,
      required: true,
    },
    goals: {
      type: String,
      required: true,
    },
    blockers: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ProjectStatusReport = mongoose.model("ProjectStatusReport", projectStatusReportSchema);

export default ProjectStatusReport;