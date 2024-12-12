import Holiday from "../../models/holidays.js";

export default class HolidayRepository {
  /**
   * Add a new holiday
   * @param {Object} holidayData - The holiday data
   * @return {Promise<Holiday>} - The created holiday
   */
  async addHoliday(holidayData) {
    try {
      const holiday = new Holiday(holidayData);
      return await holiday.save();
    } catch (error) {
      throw new Error(`Error adding holiday:${error.message}`);
    }
  }
/**
   * Get all holidays with advanced filtering
   * @param {Object} filters - Filtering options
   * @returns {Promise<Array>} - List of holidays
   */
async getAllHolidays(filters = {}) {
    try {
      // Construct dynamic query
      const query = {};

      // Holiday Type Filter
      if (filters.holiday_type) {
        query.holiday_type = filters.holiday_type;
      }

      // Location Filter
      if (filters.location) {
        query.location = filters.location;
      }

      // Holiday Name Filter (case-insensitive partial match)
      if (filters.holiday_name) {
        query.holiday_name = { $regex: filters.holiday_name, $options: 'i' };
      }

      // Year Filter
      if (filters.year) {
        query.$expr = {
          $eq: [{ $year: '$start_date' }, Number(filters.year)]
        };
      }

      // Date Range Filter
      const dateFilter = {};
      if (filters.start_date) {
        dateFilter.$gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        dateFilter.$lte = new Date(filters.end_date);
      }
      if (Object.keys(dateFilter).length > 0) {
        query.start_date = dateFilter;
      }

      // Retrieve holidays sorted by start date
      return await Holiday.find(query).sort({ start_date: 1 });
    } catch (error) {
      console.error("Error in getAllHolidays:", error);
      throw new Error(`Failed to retrieve holidays: ${error.message}`);
    }
  }

  /**
   * Get holiday by id
   * @param {String} holidayId - The holiday id
   * @return {Promise<Holiday>} - The holiday
   */
  async getHolidayById(holidayId) {
    try {
      return await Holiday.findById(holidayId);
    } catch (error) {
      throw new Error(`Error fetching holiday by ID: ${error.message}`);
    }
  }

  /**
   * Update holiday
   * @param {String} holidayId - The holiday id
   * @param {Object} holidayData - The updated holiday data
   * @return {Promise<Holiday>} - The updated holiday
   */
  async updateHoliday(holidayId, holidayData) {
    try {
      return await Holiday.findByIdAndUpdate(holidayId, holidayData, {
        new: true,
      });
    } catch (error) {
      throw new Error(`Error updating holiday: ${error.message}`);
    }
  }

  /**
   * Check if holiday exists with same name, date, and location
   * @param {String} holiday_name
   * @param {Date} start_date
   * @param {Date} end_date
   * @param {String} location
   * @param {String} excludeHolidayId - Optional holiday id to exclude from check
   * @return {Promise<Holiday>}
   */
  async checkHolidayExists(
    holiday_name,
    start_date,
    end_date,
    location,
    excludeHolidayId = null
  ) {
    try {
      const query = {
        holiday_name,
        location,
        $or: [
          { start_date: { $lte: end_date }, end_date: { $gte: start_date } },
        ],
      };

      if (excludeHolidayId) {
        query._id = { $ne: excludeHolidayId };
      }

      return await Holiday.findOne(query);
    } catch (error) {
      throw new Error(`Error checking if holiday exists: ${error.message}`);
    }
  }

  /**
   * Find a holiday by date and location
   * @param {*} date 
   * @param {*} location 
   * @returns 
   */
  async isHoliday(date, location) {
    try {
        // Ensure that the date is a valid Date object
        const parsedDate = new Date(date);

        if (isNaN(parsedDate)) {
            throw new Error("Invalid date format");
        }

        // Normalize the date to remove time portion
        parsedDate.setHours(0, 0, 0, 0);

        // Find a holiday where the date falls within the start and end range and matches the location
        const holiday = await Holiday.findOne({
            start_date: { $lte: parsedDate }, // Check if the date is on or after the start_date
            end_date: { $gte: parsedDate }, // Check if the date is on or before the end_date
            location, // Match the specified location
        });

        return holiday ? true : false; // Return true if a holiday is found, false otherwise
    } catch (err) {
        throw new Error("Error while checking holiday: " + err.message);
    }
}

}
