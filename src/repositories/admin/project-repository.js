import Project from "../../models/projects.js";

export default class ProjectRepository {
    /**
     * Add a new project
     * @param {Object} projectData - The project data
     * @return {Promise<Project>} - The created project
     */
    async addProject(projectData) {
        try {
            const project = new Project(projectData);
            return await project.save();
        } catch (error) {
            throw new Error(`Failed to add project: ${error.message}`);
        }
    }

    /**
     * Get all projects
     * @return {Promise<Project[]>} - All projects
     */
    async getAllProjects() {
        try {
            return await Project.find().populate("projectLead").sort({ createdAt: -1 });
        } catch (error) {
            throw new Error(`Failed to get projects: ${error.message}`);
        }
    }

    /**
     * Get project by id
     * @param {String} projectId - The project id
     * @return {Promise<Project>} - The project
     */
    async getProjectById(projectId) {
        try {
            const project = await Project.findOne().populate("projectLead");
            if (!project) {
                throw new Error(`Project with ID ${projectId} not found`);
            }
            return project;
        } catch (error) {
            throw new Error(`Failed to get project: ${error.message}`);
        }
    }

    /**
     * Update project
     * @param {String} projectId - The project id
     * @param {Object} projectData - The updated project data
     * @return {Promise<Project>} - The updated project
     */
    async updateProject(projectId, projectData) {
        try {
            const project = await Project.findByIdAndUpdate(projectId, projectData, { new: true })
                .populate("projectLead");
            
            if (!project) {
                throw new Error(`Project with ID ${projectId} not found`);
            }
            return project;
        } catch (error) {
            throw new Error(`Failed to update project: ${error.message}`);
        }
    }

    /**
     * Delete project
     * @param {String} projectId - The project id
     * @return {Promise<Project>} - The deleted project
     */
    async deleteProject(projectId) {
        try {
            const project = await Project.findByIdAndDelete(projectId);
            if (!project) {
                throw new Error(`Project with ID ${projectId} not found`);
            }
            return project;
        } catch (error) {
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    }

    /**
     * Check if project name exists for the client
     * @param {String} projectName
     * @param {String} clientName
     * @param {String} excludeProjectId - Optional project id to exclude from check
     * @return {Promise<Project>}
     */
    async checkProjectExists(projectName, clientName, excludeProjectId = null) {
        try {
            const query = {
                projectName: projectName,
                clientName: clientName
            };

            if (excludeProjectId) {
                query._id = { $ne: excludeProjectId };
            }

            return await Project.findOne(query);
        } catch (error) {
            throw new Error(`Failed to check project existence: ${error.message}`);
        }
    }
}