export default class TeamMembersResponse {
    async formatTeammembers(data) {
        const allMembers = data.flatMap(project => 
            project.projectTeam.flatMap(team => 
                team.team_members.map(member => ({
                    _id: member._id,
                    full_name: member.full_name
                }))
            )
        );

        return allMembers;
    }

    async formatTeamLeads(data) {
        const teamLeads = data.flatMap(project => 
            project.users.map(team => ({
                _id: team._id,
                full_name: team.full_name
            }))
        );

        return teamLeads;
    }
}
