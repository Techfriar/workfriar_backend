import moment from "moment";
export default class ProjectTeamResponse{
    async formattedResponse  (team) {
        return ({
            id:team.id,
            project:team.project,
         
        });
    };   

    async formatProjectTeamSet(teams) {
       
        try {
        return{
                id: teams.id,
                project_id: teams.project._id,
                projectname: teams.project.projectName,
                status: teams.status,
                date: `${moment(teams.start_date).format('MM/DD/YYYY')} - ${moment(teams.close_date).format('MM/DD/YYYY')}`,
                teamsMembers: teams.team_members.map(member => ({
                    id: member._id,
                    name: member.full_name,
                    profilepic: member.profile_pic,
                    email:member.email
                }))
            };
        } catch (error) {
                throw new Error(error)
        }
    }    
}