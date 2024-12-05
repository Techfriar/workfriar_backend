export default class ProjectStatusReportResponse {
    static async formatGetByIdReportResponse(report) {
        return {
            id: report._id,
            project_name: report.project_name,
            project_lead: report.project_lead,
            planned_start_date: report.planned_start_date,
            planned_end_date: report.planned_end_date,
            actual_start_date: report.actual_start_date,
            actual_end_date: report.actual_end_date,
            reporting_period: report.reporting_period,
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
            actual_start_date: report.actual_start_date,
            actual_end_date: report.actual_end_date,
            reporting_period: report.reporting_period,
            progress: report.progress,
            comments: report.comments,
        };
    }
}