import moment from "moment";
export default class ProjectTeamResponse{
    /**
     * Transform the ProjectTeam resource into an object.
     * @param {Object} team - The object with project and team members.
     * @return {Object} - An object containing selected properties to the client.
     */
    async formattedResponse  (team) {
        return ({
            id:team.id,
            project:team.project,
         
        });
    };   

    async formatProjectTeamSet(teams) {
        console.log(teams)
        const startDate=new Date(teams.project?.actual_start_date)
        const endDate=new Date(teams.project?.actual_end_date)
        try {
        return{
                id: teams._id,
                project_id: teams.project._id,
                projectname: teams.project.project_name,
                projectlogo:teams.project.project_logo,
                status: teams.project.status,
                start_date:startDate,
                end_date:endDate,
                date: `${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`,
                teamsMembers: teams.team_members.map(member => ({
                    id: member.userid._id,
                    name: member.userid.full_name,
                    profile_pic: member.userid.profile_pic,
                    email: member.userid.email
                }))
            };
        } catch (error) {
                throw new Error(error)
        }
    }   
    
    async formatTeamMembers(data)
    {
        try {
            return{
                    id: data._id,
                    project_id: data.project._id,
                    projectname: data.project.project_name,
                    date: `${moment(data.start_date).format('DD/MM/YYYY')} - ${moment(data.close_date).format('DD/MM/YYYY')}`,
                  
                        teamsMembers: data.team_members.map(member => ({
                            id: member.userid._id,
                            name: member.userid.full_name,
                            email: member.userid.email,
                            profile_pic: member.userid.profile_pic,
                            dates: member.dates.length > 0 ? 
                                {
                                    start_date: member.dates[member.dates.length - 1].start_date,
                                    end_date: member.dates[member.dates.length - 1].end_date,
                                    period: `${moment(member.dates[member.dates.length - 1].start_date).format('DD/MM/YYYY')} - ${moment(member.dates[member.dates.length - 1].end_date).format('DD/MM/YYYY')}`,
                                }
                             : {},
                             status:member.dates[member.dates.length - 1].end_date>new Date || member.dates[member.dates.length - 1].end_date==null?"active":"inactive"
                    }))
                };
            } catch (error) {
                    throw new Error(error)
            }
    }
    async formatAllEmployeeProjects(teams)
    {
        try
        {
            const length=teams.team_members[0].dates.length
            const date=new Date()
            let status=""
             if(teams.team_members[0].dates[length-1].end_date<date)
             {
                 status="inactive"
             }
             else
             {
                status="active"
             }
          
            return{
                id:teams._id,
                project_id:teams.project._id,
                projectname:teams.project.project_name,
                projectlead:teams.project.project_lead.full_name,
                clientname:teams.project.client_name.client_name,
                dates:teams.team_members[0].dates,
                status:status
            }
        }
        catch(error)
        {
            throw new Error(error)
        }
    }
    async formatTeamMembersWithTimesheet(data) {
        return data.map(member => ({
            id: member._id,
            full_name: member.full_name,
            email: member.email,
            profile_pic: member.profile_pic,
        }));
    }
}