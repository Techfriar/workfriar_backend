
export default class ProjectTeamResponse{
    async formattedResponse  (team) {
        return ({
            id:team.id,
            project:team.project,
         
        });
    };   

    async formatProjectTeamSet(categories)
    {
        return categories.map(category => ({
            id: category.id,
            category: category.category,
            timeentry: category.time_entry
        }));
    }
    
}