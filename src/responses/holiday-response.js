export default class HolidayResponse {
    /**
     * Transform the holiday resource into an object.
     * @param {Object} holiday - The holiday object to transform
     * @return {Object} - Formatted holiday object
     */
    static async format(holiday) {
        return {
          id: holiday._id,
          holiday_name: holiday.holiday_name,
          holiday_type: holiday.holiday_type,
          start_date: holiday.start_date,
          end_date: holiday.end_date,
          location: holiday.location,
          createdAt: holiday.createdAt,
          updatedAt: holiday.updatedAt,
        };
      }
      
  }
  