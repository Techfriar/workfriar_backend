import projectForecast from "../../models/admin/project-forecast.js";

export default class ForecastRepository{
    //creating new forecast
    async createForecast(forecastdata)
    {
        try
        {
            const forecast = new projectForecast(forecastdata);
            const savedForecast = await forecast.save();
            return ({status:true,data:savedForecast})
        }
        catch(error)
        {
            throw new Error(error)
        }
    }

    //getting forecasts list
    async getForecast(skip,limitNumber)
    {
        try
        {
            const forecastData=await projectForecast.find().populate({
                path:'opportunity_manager',
                select:'full_name'
            }).skip(skip).limit(limitNumber)

            const total=forecastData.length
            return {forecastData,total}
        }catch(error)
        {
            throw new Error(error)
        }
    }

    //getting a single forecast by id
    async getForecastByid(id)
    {
        try
        {
            const forecastData=await projectForecast.findById(id).populate({
                path:'project_manager opportunity_manager product_manager tech_lead account_manager team_forecast.team_member',
                select:'full_name'
            })
            return forecastData
        }catch(error)
        {
            throw new Error(error)
        }
    }

    async deleteForecast(id)
    {
        try
        {
            const data=await projectForecast.findByIdAndDelete(id)
            return data
        }catch(error)
        {
            throw new Error(error)
        }
    }

    async updateForecast(forecastData, id) {

        try {
            const updatedForecast = await projectForecast.findByIdAndUpdate(
                id,                 
                { $set: forecastData },
                { new: true, runValidators: true } 
            );
            if (!updatedForecast) {
                throw new Error("Forecast not found");
            }
            return ({status:true,data:updatedForecast})
        } catch (error) {
            throw new Error(error.message || "Failed to update forecast");
        }
    }
    
}