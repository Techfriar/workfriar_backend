import ProjectStatusReport from "../../models/admin/project-status-report.js";
import Project from "../../models/projects.js";
import User from "../../models/user.js";

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
    /**
     * Get all project names for dropdown
     * @returns {Promise<Array>} List of project names with id and name
     */
    async getProjectNamesDropdown() {
        try {
            const projects = await Project.find({}, 'project_name _id')
                .sort({ project_name: 1 }); // Sort alphabetically
            
            return projects.map(project => ({
                id: project._id,
                name: project.project_name
            }));
        } catch (error) {
            throw new Error(`Failed to retrieve project names: ${error.message}`);
        }
    }

    /**
     * Get all project leads for dropdown
     * @returns {Promise<Array>} List of project leads with id and name
     */
    async getProjectLeadsDropdown() {
        try {
            const leads = await User.find({}, 'full_name _id')
                .sort({ full_name: 1 }); // Sort alphabetically
            
            return leads.map(lead => ({
                id: lead._id,
                name: lead.full_name
            }));
        } catch (error) {
            throw new Error(`Failed to retrieve project leads: ${error.message}`);
        }
    }
}