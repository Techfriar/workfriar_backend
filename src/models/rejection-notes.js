import mongoose from "mongoose";

const RejectionNotesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    week_start_date: {
        type: Date,
        required: true
    },
    week_end_date: {
        type: Date,
        required: true
    },
});

const RejectionNotes = mongoose.model('RejectionNotes', RejectionNotesSchema);

export default RejectionNotes;