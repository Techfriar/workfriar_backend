import ProjectStatusReport from "../../models/admin/project-status-report.js";

export default class ProjectStatusReportRepository {
    async addReport(reportData) {
        try {
            const report = new ProjectStatusReport(reportData);
            return await report.save();
        } catch (error) {
            throw new Error(`Failed to add report: ${error.message}`);
        }
    }

    async getAllReports() {
        try {
            return await ProjectStatusReport.find()
                .populate("project_name")
                .populate("project_lead")
                .sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to get reports: ${error.message}`);
        }
    }

    async getReportById(reportId) {
        try {
            const report = await ProjectStatusReport.findById(reportId)
                .populate("project_name")
                .populate("project_lead");
            if (!report) {
                throw new Error(`Report with ID ${reportId} not found`);
            }
            return report;
        } catch (error) {
            throw new Error(`Failed to get report: ${error.message}`);
        }
    }

    async updateReport(reportId, reportData) {
        try {
            const report = await ProjectStatusReport.findByIdAndUpdate(
                reportId,
                reportData,
                { new: true }
            )
                .populate("project_name")
                .populate("project_lead");
            
            if (!report) {
                throw new Error(`Report with ID ${reportId} not found`);
            }
            return report;
        } catch (error) {
            throw new Error(`Failed to update report: ${error.message}`);
        }
    }

    async deleteReport(reportId) {
        try {
            const report = await ProjectStatusReport.findByIdAndDelete(reportId);
            if (!report) {
                throw new Error(`Report with ID ${reportId} not found`);
            }
            return report;
        } catch (error) {
            throw new Error(`Failed to delete report: ${error.message}`);
        }
    }
}