import moment from "moment";
export default class ProjectStatusReportResponse {
  static formatDate(date) {
    if (!date) return null;
    return moment(date).format("DD/MM/YYYY");
  }

  static async formatGetByIdReportResponse(report) {
    const project = report.project_name || {};

    return {
      id: report._id,
      project_name: project.project_name
      ? {
          id: report.project_name._id,
          name: project.project_name,
        }
      : null,
      project_lead: report.project_lead,
      planned_start_date: this.formatDate(project.planned_start_date),
      planned_end_date: this.formatDate(project.planned_end_date),
      actual_start_date: this.formatDate(project.actual_start_date),
      actual_end_date: this.formatDate(project.actual_end_date),
      reporting_period: this.formatDate(report.reporting_period),
      progress: report.progress,
      comments: report.comments,
      accomplishments: report.accomplishments,
      goals: report.goals,
      blockers: report.blockers,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
  static async formatGetAllReportResponse(report) {
    const project = report.project_name || {};
    return {
      id: report._id,
      project_name: project.project_name,
      project_lead: report.project_lead.full_name,
      actual_start_date: this.formatDate(project.actual_start_date),
      actual_end_date: this.formatDate(project.actual_end_date),
      reporting_period: this.formatDate(report.reporting_period),
      progress: report.progress,
      comments: report.comments,
    };
  }
}
