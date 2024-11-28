import moment from "moment";
export default class ForecastResponse{
    //Response after creating a new forecast
    async formattedResponse  (forecast) {
        return ({
            id:forecast.id,
            category:forecast.opportunity_name,
        });
    };   
//formatted response for forecast
    async formatForecastSet(forecasts)
    {
        return forecasts.map(forecast=> ({
            id: forecast.id,
            opportunity_name: forecast.opportunity_name,
            opportunity_manager:forecast.opportunity_manager.full_name,
            opportunity_date: `${moment(forecast.opportunity_start_date).format('MM/DD/YYYY')} - ${moment(forecast.opportunity_close_date).format('MM/DD/YYYY')}`,
            client_name:forecast.client_name,
            opportunity_stage:forecast.opportunity_stage,
            status:forecast.status
        }));
    }

//Formatted Response for Entire data 
    async formattedFullResponse(forecast)
    {
        return({
            id:forecast._id,
            opportunity_name:forecast.opportunity_name,
            opportunity_manager:forecast.opportunity_manager.full_name,
            client_name:forecast.client_name,
            opportunity_description:forecast.opportunity_description,
            opportunity_start_date:moment(forecast.opportunity_start_date).format('MM/DD/YYYY'),
            opportunity_close_date:moment(forecast.opportunity_close_date).format('MM/DD/YYYY'),
            expected_project_start_date:moment(forecast.expected_project_start_date).format('MM/DD/YYYY'),
            expected_project_end_date:moment(forecast.expected_project_end_date).format('MM/DD/YYYY'),
            estimated_revenue:forecast.estimated_revenue,
            opportunity_stage:forecast.opportunity_stage,
            expected_resource_breakdown:forecast.expected_resource_breakdown,
            project_manager:forecast.project_manager.full_name,
            product_manager:forecast. product_manager.full_name,
            tech_lead:forecast. tech_lead.full_name,
            account_manager:forecast.account_manager.full_name,
            estimated_project_completion:forecast.estimated_project_completion,
            status:forecast.status,
            team_forecast: forecast.team_forecast.map(item => ({
                name: item.team_member.full_name, 
                forecast_hours: item.forecast_hours 
              })),
        })
    }
}