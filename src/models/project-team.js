import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    dates: [
        {
            start_date: { type: Date},
            end_date: { type: Date }
        }
    ]
}, { timestamps: true }); 


const projectTeamSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project',
        required: true,              
        trim: true
    },
    team_members: [teamMemberSchema] 
}, { timestamps: true });

const projectTeam = mongoose.model('Project Team', projectTeamSchema);
export default projectTeam
