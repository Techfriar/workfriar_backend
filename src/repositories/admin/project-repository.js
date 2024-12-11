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
    async getAllProjects({ page = 1, limit = 10 } = {}) {
        try {
          const skip = (page - 1) * limit;
          const projects = await Project.find()
            .populate("project_lead").populate("categories")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
          const totalCount = await Project.countDocuments();
          return { projects, totalCount };
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
      const project = await Project.findById(projectId)
        .populate("project_lead")
        .lean();
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
      const project = await Project.findByIdAndUpdate(projectId, projectData, {
        new: true,
      }).populate("project_lead");

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
   * @param {String} project_name
   * @param {String} client_name
   * @param {String} excludeProjectId - Optional project id to exclude from check
   * @return {Promise<Project>}
   */
  async checkProjectExists(project_name, client_name, excludeProjectId = null) {
    try {
      const query = {
        project_name: project_name,
        client_name: client_name,
      };

      if (excludeProjectId) {
        query._id = { $ne: excludeProjectId };
      }

            return await Project.findOne(query);
        } catch (error) {
            throw new Error(`Failed to check project existence: ${error.message}`);
        }
    }
    async updateProjectTimeEntry(id, timeEntry, closeDate) {
        try {
            const record = await Project.findOne({ _id: id });
            if (!record) {
                throw new Error(`Project with ID ${id} not found`);
            }
            if (timeEntry === "closed") {
                if (["Cancelled", "Completed", "On hold"].includes(record.status)) {
                    const data = await Project.updateOne({ _id: id }, { 
                        $set: { 
                            open_for_time_entry: "closed", 
                            effective_close_date: closeDate 
                        } 
                    });
                    return data;
                } 
            } else {
                const data = await Project.updateOne({ _id: id }, { 
                    $set: { open_for_time_entry: "opened",
                        effective_close_date: closeDate 
                     } 
                });
                return data;
            }
        } catch (error) {
            throw new Error("Error updating project time entry");
        }
    }
    
    async updateProjectStatus(projectId, status) {
        try {
            const result = await Project.updateOne({ _id: projectId }, { status: status });
            return result
        } catch (error) {
            throw new Error(`Error updating project status: ${error.message}`);
        }
    }

    /**
     * Get projects by project lead
     * @param {String} projectLeadId - The project lead id
     * @return {Promise<Project[]>} - The projects 
     */    
    async getProjectsByProjectLead(projectLeadId) {
        try {
            const projects = await Project.find({ project_lead: projectLeadId }).lean();
            return projects;
        } catch (error) {
            throw new Error(`Failed to get projects: ${error.message}`);
        }
    }

    /**
     * Get project by userId where user is included in this project
     * 
     */
    async getAllProjectsByUser(userId) {
        try{
            
        }
        catch(error) {

        }
    }

  
}
