import Project from "../../models/projects.js";

export default class ProjectRepository {
    /**
     * Add a new project
     * @param {Object} projectData - The project data
     * @return {Promise<Project>} - The created project
     */
    async addProject(projectData) {
        const project = new Project(projectData);
        return await project.save();
    }

    /**
     * Get all projects with pagination using POST
     * @param {Object} options - Pagination options
     * @param {Object} filters - Query filters from request body
     * @return {Promise<Object>} - Paginated projects
     */
    async getAllProjects(options, filters = {}) {
        const query = {};

        // Apply filters from request body
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.clientName) {
            query.clientName = new RegExp(filters.clientName, "i");
        }
        if (filters.projectName) {
            query.projectName = new RegExp(filters.projectName, "i");
        }

        // Extract pagination options
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        // Fetch total count for pagination
        const total = await Project.countDocuments(query);

        // Fetch paginated data
        const projects = await Project.find(query)
            .populate("projectLead")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Return paginated result
        return {
            docs: projects,
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        };
    }

    /**
     * Get project by id
     * @param {String} projectId - The project id
     * @param {Object} filters - Additional filters from request body
     * @return {Promise<Project>} - The project
     */
    async getProjectById(projectId, filters = {}) {
        const query = { _id: projectId };

        // Apply additional filters if needed
        if (filters.status) {
            query.status = filters.status;
        }

        return await Project.findOne(query).populate("projectLead");
    }

    /**
     * Update project
     * @param {String} projectId - The project id
     * @param {Object} projectData - The updated project data
     * @return {Promise<Project>} - The updated project
     */
    async updateProject(projectId, projectData) {
        return await Project.findByIdAndUpdate(projectId, projectData, { new: true })
            .populate("projectLead");
    }

    /**
     * Delete project
     * @param {String} projectId - The project id
     * @return {Promise<Project>} - The deleted project
     */
    async deleteProject(projectId) {
        return await Project.findByIdAndDelete(projectId);
    }

    /**
     * Check if project name exists for the client
     * @param {String} projectName 
     * @param {String} clientName
     * @param {String} excludeProjectId - Optional project id to exclude from check
     * @return {Promise<Project>}
     */
    async checkProjectExists(projectName, clientName, excludeProjectId = null) {
        const query = {
            projectName: projectName,
            clientName: clientName
        };

        if (excludeProjectId) {
            query._id = { $ne: excludeProjectId };
        }

        return await Project.findOne(query);
    }
}
