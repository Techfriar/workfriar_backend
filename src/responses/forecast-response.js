
export default class ForecastResponse{
    async formattedResponse  (forecast) {
        return ({
            id:forecast.id,
            category:forecast.opportunity_name,
        });
    };   
//formatted response for forecast
    async formatCategorySet(categories)
    {
        return categories.map(category => ({
            id: category.id,
            category: category.category,
            timeentry: category.time_entry
        }));
    }
    
}