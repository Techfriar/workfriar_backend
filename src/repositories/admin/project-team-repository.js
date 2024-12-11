import projectTeam from "../../models/project-team.js";

class ProjectTeamRepository
{
    //Function for creating new project team
    async createTeam(teamData)
    { 
        try
        {
        const{project,status,startDate,endDate,teamMembers}=teamData
        const data=await projectTeam.create({
          project,
          status,
          start_date:startDate,
          end_date:endDate,
          team_members:teamMembers
        })
        return ({status:true,data:data})
    }catch(error)
    {
        throw new Error(error)
    }
    }
    //Function for retrieveing all project team
    async getAllProjectTeam()
    {
        try
        {
            const teamData=await projectTeam.find().populate({
                path: 'project',  
                select: 'projectName _id'    
            }).populate({
                    path: 'team_members' ,  
                    select: 'full_name profile_pic'    
            }).lean()
            return teamData
        }catch(error)
        {
           throw new Error(error)
        }
    }

    //Function for getting team of a particular project
    async getProjectTeambyId(projectid) {
        const id = projectid
        try {
            const data = await projectTeam
                .find({ project: id })
                .populate({
                    path: 'project',
                    select: 'projectName _id',
                })
                .populate({
                    path: 'team_members',
                    select: 'full_name email',
                })
                .lean(); 
            return data[0];
        } catch (error) {
           throw new Error(error)
            
        }
    }

    /*
    *here i fetch just team members array of ids
    */
    async getTeamMembersbyId(projectId) {
        try {
            const data = await projectTeam.find({project: projectId}).lean()

            return data[0]
        } catch (error) {
            
        }
    }

    //Function for editing a project team
    async updateProjectTeam(id, teamData) {
        try {
            const updateFields = {};
            if (teamData.project !== undefined) updateFields.project = teamData.project;
            if (teamData.status !== undefined) updateFields.status = teamData.status;
            if (teamData.startDate !== undefined) updateFields.start_date = teamData.startDate;
            if (teamData.endDate !== undefined) updateFields.end_date = teamData.endDate;
            if (teamData.teamMembers !== undefined) updateFields.team_members = teamData.teamMembers;
 
            const updatedTeam = await projectTeam.findByIdAndUpdate(
                id,                 
                { $set: updateFields }, 
                { new: true }           
            );
            if (!updatedTeam) {
                throw new Error("Project team not found or could not be updated.");
            }
    
            return ({status:true,data:updatedTeam})
        } catch (error) {
            throw new Error(`Failed to update project team: ${error.message}`);
        }
    }
    
    /**
     *  Get project team expanded by projectId
     * @param {String} projectId - The ID of the project
     *  @returns {Promise<ProjectTeam>} - The project team
     */

    async getProjectTeamExpandedByProjectId(projectId, skip, limit) {
        try {
            const projectTeamMembers = await projectTeam.find({ project: projectId })
            .populate({
                path: 'team_members',
                select: 'full_name _id'
            })
            .skip(skip)
            .limit(limit)
            .lean();

            if (!projectTeamMembers) {
                throw new Error(`Project team not found for project ID: ${projectId}`);
            }

            return projectTeamMembers;
        } catch (error) {
            throw new Error(`Failed to get project team: ${error.message}`);
        }
    }
}

export default ProjectTeamRepository