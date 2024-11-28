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
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
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
        enum:['Prospecting','Closed Lost','Closed Won'],
        trim:true
    },
    expected_resource_breakdown:{
        type:String,
        trim:true
    },
    project_manager:{
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    product_manager:{
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    tech_lead:{
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    account_manager:{
         type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    estimated_project_completion:{
        type:String
    },
    status:{
        type:String,
        enum:['Not Started','In Progress','On Hold','Cancelled'],
        default:'Not Started'
    },
    team_forecast:[{
        team_member:{
             type: mongoose.Schema.Types.ObjectId, ref: 'User'
        },
        forecast_hours:{
            type:String
        }
    }]
},{timestamps:true})
const projectForecast=mongoose.model('Forecast',forecastSchema)

export default projectForecast