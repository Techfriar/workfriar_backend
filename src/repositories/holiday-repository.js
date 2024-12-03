// repositories/HolidayRepo.js
import Holiday from "../models/holidays.js";

class HolidayRepository {
  // Check if a given date is a holiday
  async isHoliday(date) {
    try {
      // Ensure that the date is a Date object
      const parsedDate = new Date(date);

      console.log(parsedDate);

      // Check if it's a valid Date object
      if (isNaN(parsedDate)) {
        throw new Error("Invalid date format");
      }

      // Normalize the date to remove time portion (set hours to 0)
      parsedDate.setHours(0, 0, 0, 0);

      // Convert parsedDate to ISO string to compare only date (no time)
      const isoParsedDate = parsedDate.toISOString();

      // Find holiday based on normalized date
      const holiday = await Holiday.findOne({
        holidayDate: {
          $gte: new Date(isoParsedDate), // Start of the day (00:00:00.000)
          $lt: new Date(
            new Date(isoParsedDate).setDate(parsedDate.getDate() + 1)
          ), // End of the day (23:59:59.999)
        },
      });

      return holiday ? true : false; // Return true if holiday found, false otherwise
    } catch (err) {
      throw new Error("Error while checking holiday: " + err.message);
    }
  }

  /**
   * Add a new holiday
   * @param {Object} holidayData - The holiday data
   * @return {Promise<Holiday>} - The created holiday
   */
  async addHoliday(holidayData) {
    const holiday = new Holiday(holidayData);
    return await holiday.save();
  }

  /**
   * Get all holidays with pagination using POST
   * @param {Object} options - Pagination options
   * @param {Object} filters - Query filters from request body
   * @return {Promise<Object>} - Paginated holidays
   */
  async getAllHolidays(options, filters = {}) {
    const query = {};

    // Apply filters from request body
    if (filters.holidayType) {
      query.holidayType = filters.holidayType;
    }
    if (filters.location) {
      query.location = new RegExp(filters.location, "i");
    }

    // Extract pagination options
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Fetch total count for pagination
    const total = await Holiday.countDocuments(query);

    // Fetch paginated data
    const holidays = await Holiday.find(query)
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    // Return paginated result
    return {
      docs: holidays,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    };
  }

  /**
   * Get holiday by id
   * @param {String} holidayId - The holiday id
   * @return {Promise<Holiday>} - The holiday
   */
  async getHolidayById(holidayId) {
    return await Holiday.findById(holidayId);
  }

  /**
   * Update holiday
   * @param {String} holidayId - The holiday id
   * @param {Object} holidayData - The updated holiday data
   * @return {Promise<Holiday>} - The updated holiday
   */
  async updateHoliday(holidayId, holidayData) {
    return await Holiday.findByIdAndUpdate(holidayId, holidayData, {
      new: true,
    });
  }

  /**
   * Delete holiday
   * @param {String} holidayId - The holiday id
   * @return {Promise<Holiday>} - The deleted holiday
   */
  async deleteHoliday(holidayId) {
    return await Holiday.findByIdAndDelete(holidayId);
  }

  /**
   * Check if holiday exists with same name and date
   * @param {String} holidayName
   * @param {Date} date
   * @param {String} excludeHolidayId - Optional holiday id to exclude from check
   * @return {Promise<Holiday>}
   */
  async checkHolidayExists(holidayName, date, excludeHolidayId = null) {
    const query = {
      holidayName: holidayName,
      date: date,
    };

    if (excludeHolidayId) {
      query._id = { $ne: excludeHolidayId };
    }

    return await Holiday.findOne(query);
  }
}

export default HolidayRepository;
