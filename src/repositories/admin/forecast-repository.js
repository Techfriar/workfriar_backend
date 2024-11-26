import projectForecast from "../../models/admin/project-forecast.js";

export default class ForecastRepository{
    //creating new forecast
    async createForecast(forecastdata)
    {
        try
        {
            const forecast = new projectForecast(forecastdata);
            const savedForecast = await forecast.save();
            return savedForecast
        }
        catch(error)
        {
            throw new Error(error)
        }
    }
}