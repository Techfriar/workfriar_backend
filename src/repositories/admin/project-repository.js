import mongoose from "mongoose";
import Project from "../../models/projects.js";
import client from "../../models/client.js";
import User from "../../models/user.js";

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
        .populate({
          path: "project_lead",
          select: "full_name -_id",
        })
        .populate({
          path: "categories",
          select: "category -_id",
        })
        .populate({
          path: "client_name",
          select: "client_name -_id",
        })
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
        .populate({
          path: "project_lead",
          select: "full_name",
        })
        .populate({
          path: "categories",
          select: "category",
        })
        .populate({
          path: "client_name",
          select: "client_name",
        })
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
      })
        .populate({
          path: "project_lead",
          select: "full_name -_id",
        })
        .populate({
          path: "categories",
          select: "category",
        })
        .populate({
          path: "client_name",
          select: "client_name -_id",
        });

      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }
      return project;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
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
          const data = await Project.updateOne(
            { _id: id },
            {
              $set: {
                open_for_time_entry: "closed",
                effective_close_date: closeDate,
              },
            }
          );
          return data;
        }
      } else {
        const data = await Project.updateOne(
          { _id: id },
          {
            $set: {
              open_for_time_entry: "opened",
              effective_close_date: closeDate,
            },
          }
        );
        return data;
      }
    } catch (error) {
      throw new Error("Error updating project time entry");
    }
  }

  async updateProjectStatus(projectId, status) {
    try {
      const result = await Project.updateOne(
        { _id: projectId },
        { status: status }
      );
      return result;
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
      const projects = await Project.find({
        project_lead: projectLeadId,
      }).lean();
      return projects;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Get the count of the projects where the user is included in the project team
   * @param {string} userId - The ID of the user to get the project count for
   * @returns {Promise<number>} - The count of the projects where the user is included in the project team
   */
  async getProjectCountByUser(userId) {
    try {
      // Aggregate to count all projects where the user is a team member or a project lead
      const projects = await Project.aggregate([
        {
          $lookup: {
            from: "project teams", // Assuming the collection name is 'projectteams'
            localField: "_id",
            foreignField: "project",
            as: "team",
          },
        },
        {
          $unwind: {
            path: "$team",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              { project_lead: new mongoose.Types.ObjectId(userId) }, // As project lead
              { "team.team_members": new mongoose.Types.ObjectId(userId) }, // As team member
            ],
          },
        },
        {
          $count: "count", // Count the matched projects
        },
      ]);

      // Extract the count or default to 0 if no projects match
      return projects[0]?.count || 0;
    } catch (error) {
      console.log(error, "error");
    }
  }

  /**
   * Get project by userId where user is included in this project
   *
   */
  async getAllOpenProjectsByUser(userId) {
    try {
      const projects = await Project.aggregate([
        {
          $lookup: {
            from: "project teams",
            localField: "_id",
            foreignField: "project",
            as: "team",
          },
        },
        {
          $unwind: {
            path: "$team",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$team.team_members",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$team.team_members.dates",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  { 
                    $and: [
                      { "team.team_members.userid": new mongoose.Types.ObjectId(userId) },
                      { "team.team_members.dates.start_date": { $lte: new Date() } },
                      {
                        $or: [
                          { "team.team_members.dates.end_date": null },
                          { "team.team_members.dates.end_date": { $gte: new Date() } }
                        ]
                      }
                    ]
                  },
                  { project_lead: new mongoose.Types.ObjectId(userId) },
                ],
              },
              {
                $or: [
                  { open_for_time_entry: { $ne: "closed" } },
                  {
                    $and: [
                      { effective_close_date: { $ne: null } },
                      { effective_close_date: { $gt: new Date() } },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          $group: {
            _id: "$_id",
            project_name: { $first: "$project_name" },
          },
        },
      ]);
      return projects;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Get project by userId where user is included in this project
   *
   */
  async getAllProjectsByUser(userId, skip, limit) {
    try {
      // console.log(projects_, 'projects_')
      const projects = await Project.aggregate([
        {
          $lookup: {
            from: "project teams",
            localField: "_id",
            foreignField: "project",
            as: "teamDetails",
          },
        },
        {
          $lookup: {
            from: "users", // Collection name for users
            localField: "project_lead",
            foreignField: "_id",
            as: "project_lead",
          },
        },
        {
          $lookup: {
            from: "clients", // Collection name for clients
            localField: "client_name",
            foreignField: "_id",
            as: "client",
          },
        },
        {
          $unwind: {
            path: "$teamDetails",
            preserveNullAndEmptyArrays: true, // Keep projects without teams
          },
        },
        {
          $unwind: {
            path: "$project_lead",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$client",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                "teamDetails.team_members": new mongoose.Types.ObjectId(userId),
              },
              { "project_lead._id": new mongoose.Types.ObjectId(userId) },
            ],
          },
        },
        {
          $group: {
            _id: "$_id",
            // Add other project fields you want to include
            project_lead: { $first: "$project_lead" },
            project_name: { $first: "$project_name" },
            client_name: { $first: "$client" },
            actual_start_date: { $first: "$actual_start_date" },
            actual_end_date: { $first: "$actual_end_date" },
            status: { $first: "$status" },
          },
        },
      ])
        .skip(skip)
        .limit(limit);

      return projects;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

    async getCategoriesByProject(projectid)
    {
        try
        {
            const project = await Project.findById(projectid).populate({
                path: "categories",
                select: "_id category time_entry",
            })
            .lean();
            return project.categories?.filter(category => category.time_entry === 'opened')
        }catch(error)
        {
            throw new Error(error)
        }
    }
  
    async getProjectDates(projectid)
    {
        try
        {
            const dates=await Project.findById(projectid).select("actual_start_date actual_end_date").lean();
            return dates;
        }catch(error)
        {
            throw new Error(error)
        }
    }
}
