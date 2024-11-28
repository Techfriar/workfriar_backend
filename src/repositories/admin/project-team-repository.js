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
        return data
    }catch(error)
    {
        throw new Error(error)
    }
    }
}

export default ProjectTeamRepository