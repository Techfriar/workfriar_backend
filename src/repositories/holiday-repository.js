// repositories/HolidayRepo.js
import Holiday from '../models/hoilday.js';

class HolidayRepository {

  // Check if a given date is a holiday
  async isHoliday(date) {
        try {
            // Ensure that the date is a Date object
            const parsedDate = new Date(date);

            console.log(parsedDate)
            
            // Check if it's a valid Date object
            if (isNaN(parsedDate)) {
                throw new Error('Invalid date format');
            }

            // Normalize the date to remove time portion (set hours to 0)
            parsedDate.setHours(0, 0, 0, 0);

            // Convert parsedDate to ISO string to compare only date (no time)
            const isoParsedDate = parsedDate.toISOString();

            // Find holiday based on normalized date
            const holiday = await Holiday.findOne({
                holidayDate: {
                    $gte: new Date(isoParsedDate), // Start of the day (00:00:00.000)
                    $lt: new Date(new Date(isoParsedDate).setDate(parsedDate.getDate() + 1)), // End of the day (23:59:59.999)
                }
            });
    
            return holiday ? true : false; // Return true if holiday found, false otherwise
        } catch (err) {
            throw new Error('Error while checking holiday: ' + err.message);
        }
  }
}

export default HolidayRepository;
