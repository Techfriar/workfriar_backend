// models/Holiday.js
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const HolidaySchema = new Schema({
  holidayDate: { 
    type: Date, 
    required: true,
  },
  type: {
    type: String, // e.g., "Public Holiday", "Religious", etc.
    required: true,
  },
  location: {
    type: String, // Location where the holiday is observed (e.g., "India", "UAE")
    required: true,
  },
  name: {
    type: String, // Name of the holiday (e.g., "Christmas", "Diwali")
    required: true,
  },
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', HolidaySchema);

export default Holiday;
