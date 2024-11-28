import projectTeam from "../../models/project-team";

class ProjectTeamRepository
{
    //Function for creating new project team
    async createTeam(teamData)
    {
        try
        {
        const{project,status,start_date,end_date,team_members}=teamData
        const data=await projectTeam.create({
          project,
          status,
          start_date,
          end_date,
          team_members
        })
        return data
    }catch(error)
    {
        throw new Error(error)
    }
    }
}

export default ProjectTeamRepository