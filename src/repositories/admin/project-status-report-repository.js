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

    async getAllReports({ page = 1, limit = 10 } = {}) {
        try {
            const skip = (page - 1) * limit;
            const reports = await ProjectStatusReport.find()
            .populate({
                path: "project_name",
                select: "project_name -_id",
            })
            .populate({
                path: "project_lead",
                select: "full_name -_id",
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    
            const totalCount = await ProjectStatusReport.countDocuments();
    
            return { reports, totalCount };
        } catch (error) {
            throw new Error(`Failed to get reports: ${error.message}`);
        }
    }
    

    async getReportById(reportId) {
        try {
            const report = await ProjectStatusReport.findById(reportId)
            .populate({
                path: "project_name",
                select: "project_name",
            })
            .populate({
                path: "project_lead",
                select: "full_name",
            });
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
            .populate({
                path: "project_name",
                select: "project_name -_id",
            })
            .populate({
                path: "project_lead",
                select: "full_name -_id",
            });
            
            if (!report) {
                throw new Error(`Report with ID ${reportId} not found`);
            }
            return report;
        } catch (error) {
            throw new Error(`Failed to update report: ${error.message}`);
        }
    }
}