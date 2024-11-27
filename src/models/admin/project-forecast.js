import mongoose from "mongoose";
/*
Define Project Forecast Schema
*/
const forecastSchema=new mongoose.Schema({
    opportunity_name:{
        type:String,
        required:true,
        trim:true,
    },
    opportunity_manager:{
         type: mongoose.Schema.Types.ObjectId, ref: 'Employee'
    },
    opportunity_description:{
        type:String,
        required:true,
        trim:true,
    },
    client_name:{
        type:String,
        required:true,
        trim:true,
    },
    billing_model:{
        type:String,
        required:true,
        trim:true,
    },
    opportunity_start_date:{
        type:Date,
        required:true
    },
    opportunity_close_date:{
        type:Date,
        required:true
    },
    expected_project_start_date:{
        type:Date,
    },
    expected_project_end_date:{
        type:Date,
    },
    estimated_revenue:{
        type:String, 
        trim:true
    },
    opportunity_stage:{
        type:String,
        required:true,
        trim:true
    },
    expected_resource_breakdown:{
        type:String,
        trim:true
    },
    project_manager:{
         type: mongoose.Schema.Types.ObjectId, ref: 'Employee'
    },
    product_manager:{
         type: mongoose.Schema.Types.ObjectId, ref: 'Employee'
    },
    tech_lead:{
         type: mongoose.Schema.Types.ObjectId, ref: 'Employee'
    },
    account_manager:{
         type: mongoose.Schema.Types.ObjectId, ref: 'Employee'
    },
    estimated_project_completion:{
        type:String
    },
    team_forecast:[{
        team_member:{
             type: mongoose.Schema.Types.ObjectId, ref: 'employee'
        },
        forecast_hours:{
            type:String
        }
    }]
},{timestamps:true})
const projectForecast=mongoose.model('Forecast',forecastSchema)

export default projectForecast