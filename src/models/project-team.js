import mongoose from "mongoose";

/*
    Define Project Team Schema
*/
const projectTeamSchema=new mongoose.Schema({
    project:{
        type:mongoose.Schema.Types.ObjectId, ref: 'Project',
        required: true,
        trim:true
    },
    status:{
        type:String,
        enum:['Not Started','On hold','Cancelled','Completed'],
        required:true
    },
    start_date:{
        type:Date,
        required:true
    },
    end_date:{
        type:Date,
    },
    team_members:[
       {
             type: mongoose.Schema.Types.ObjectId, ref: 'User',
             required:true
       },
    ]
},{timestamps:true})
const projectTeam=mongoose.model('Project Team',projectTeamSchema)

export default projectTeam