import moment from "moment";

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
          start_date: moment(holiday.start_date).format('ddd, DD MMMM, YYYY'),
          end_date: moment(holiday.end_date).format('ddd, DD MMMM, YYYY'),
          location: holiday.location,
          createdAt: holiday.createdAt,
          updatedAt: holiday.updatedAt,
        };
      }

    static async demoformat(holiday) {
        return {
          holiday_id: holiday._id,
          holiday_name: holiday.holiday_name,
          holiday_date: moment(holiday.start_date).format('ddd, DD MMMM, YYYY'),
        };
      }
  }