import RejectionNotes from "../../models/rejection-notes.js";

export default class RejectionNotesRepository {
    // Create a new rejection notes
    async create(userId, message, week_start_date, week_end_date) {
        const rejectionNotes = new RejectionNotes({
            userId,
            message,
            week_start_date,
            week_end_date
        });
        return await rejectionNotes.save();
    }

    // Get all rejection notes
    async getAll() {
        return await RejectionNotes.find();
    }

    // Get rejection notes by user ID
    async getByUserId(userId) {
        return await RejectionNotes.find({ userId });
    }

    // Get rejection notes by week and user ID
    async getByWeek(week_start_date, week_end_date, userId) {
        return await RejectionNotes.findOne({
            $and: [
                { week_start_date: { $gte: week_start_date } },
                { week_end_date: { $lte: week_end_date } },
                { userId}
            ]
        });
    }

    // Update rejection notes
    async update(id, message) {
        return await RejectionNotes.findByIdAndUpdate(id, { message }, { new: true });
    }

    // Delete rejection notes
    async delete(id) {
        return await RejectionNotes.findByIdAndDelete(id);
    }
}
    
   