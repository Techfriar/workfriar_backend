import moment from "moment";

export default class HolidayResponse {
  static formatDate(date) {
    if (!date) return null;
    return moment(date).format("DD/MM/YYYY");
  }
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
          start_date: this.formatDate(holiday.start_date),
          end_date: this.formatDate(holiday.end_date),
          location: holiday.location,
          createdAt: holiday.createdAt,
          updatedAt: holiday.updatedAt,
        };
      }
      
  }
  