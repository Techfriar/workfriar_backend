import projectTeam from "../../models/project-team.js";


class ProjectTeamRepository
{
    //Function for creating new project team
    async createTeam(teamData)
    { 
        try
        {
        const{project,team_members}=teamData
        const data=await projectTeam.create({
          project,
          team_members:team_members
        })
        return ({status:true,data:data})
    }catch(error)
    {

        throw new Error(error)
    }
    }

    //Function for setting end date for a user
    async  setEndDateForTeammember(projectTeamId, userId, end_date) {
        try {
            end_date = new Date(end_date);
         
            const data = await projectTeam.findOneAndUpdate(
                {
                    _id: projectTeamId,
                    'team_members': {
                        $elemMatch: {
                            'userid': userId,
                            'dates': {
                                $elemMatch: {
                                    'end_date': null
                                }
                            }
                        }
                    }
                },
                {
                    $set: {
                        'team_members.$[outer].dates.$[inner].end_date': end_date
                    }
                },
                {
                    arrayFilters: [
                        { 'outer.userid': userId },
                        { 'inner.end_date': null }
                    ],
                    new: true
                }
            );
    
            if (!data) {
                return {
                    status: false,
                    message: 'No matching document found or dates already updated.'
                };
            }
            return {
                status: true,
                message: 'End Date Set',
                data: data
            };
        } catch (error) {
          
            throw new Error(`Error updating end_date: ${error.message}`);
        }
    }
    
    
    //Function for setting new startDate for an employee
    async activateTeammember(projectTeamId, userId, start_date) {
        try {
            start_date = new Date(start_date);
            const data = await projectTeam.findOneAndUpdate(
                {
                    _id: projectTeamId, 
                    "team_members.userid": userId 
                },
                {
                    $push: { 
                        "team_members.$.dates": { 
                            start_date: start_date, 
                            end_date: null 
                        }
                    },
                    $set: { "team_members.$.status": "active" } 
                },
                { new: true } 
            );
            if (!data) {
                throw new Error("Project Team or User not found.");
            }
    
            return { status: true, data: data };
        } catch (error) {
            throw new Error(error.message || "Failed to activate team member.");
        }
    }
    
    
    
    
    //Function for retrieveing all project team
    async getAllProjectTeam() {
        try {
            const teamData = await projectTeam.find()
                .populate({
                    path: 'project',
                    select: 'project_name _id status actual_start_date actual_end_date project_logo' 
                })
                .populate({
                    path: 'team_members.userid',
                    select: 'full_name profile_pic email' 
                })
                .lean(); 
            return { status: true, data: teamData }; 
        } catch (error) {
            throw new Error(error); 
        }
    }
    
  
    async getProjectTeambyId(projectid) {
        const id = projectid
        try {
            const data = await projectTeam
                .find({ project: id })
                .populate({
                    path: 'project',
                    select: 'project_name _id',
                })
                .populate({
                    path: 'team_members.userid',
                    select: 'full_name email profile_pic',
                })
                .lean(); 
            return data;
        } catch (error) {
           throw new Error(error)
            
        }
    }

    async getProjectsByEmployeeId(employeeid) {
        try {
            const data = await projectTeam
                .find({ "team_members.userid": employeeid }) 
                .populate({
                    path: 'project',
                    select: 'project_name _id project_lead client_name', 
                    populate: [
                        {
                            path: 'project_lead', 
                            select: 'full_name'
                        },
                        {
                            path: 'client_name',
                            select: 'client_name'
                        }
                    ]
                })
                .lean(); 
    
         
            data.forEach(project => {
                project.team_members = project.team_members.filter(member => member.userid.toString() === employeeid);
            });
    
            return data;
        } catch (error) {
            throw new Error(error);
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