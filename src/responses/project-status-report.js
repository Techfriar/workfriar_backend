import moment from "moment";
export default class ProjectStatusReportResponse {
  static formatDate(date) {
    if (!date) return null;
    return moment(date).format("DD/MM/YYYY");
  }

  static async formatGetByIdReportResponse(report) {
    return {
      id: report._id,
      project_name: report.project_name,
      project_lead: report.project_lead,
      planned_start_date: this.formatDate(report.planned_start_date),
      planned_end_date: this.formatDate(report.planned_end_date),
      actual_start_date: this.formatDate(report.actual_start_date),
      actual_end_date: this.formatDate(report.actual_end_date),
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
    return {
      id: report._id,
      project_name: report.project_name,
      project_lead: report.project_lead,
      actual_start_date: this.formatDate(report.actual_start_date),
      actual_end_date: this.formatDate(report.actual_end_date),
      reporting_period: this.formatDate(report.reporting_period),
      progress: report.progress,
      comments: report.comments,
    };
  }
}
