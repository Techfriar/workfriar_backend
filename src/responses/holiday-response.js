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
          holiday_date: moment(holiday.start_date).format('ddd, DD MMMM, YYYY'),
          start_date: holiday.start_date,
          end_date: holiday.end_date,
          location: holiday.location,
          createdAt: holiday.createdAt,
          updatedAt: holiday.updatedAt,
        };
      }

      static async groupByType(holidays) {
        const groupedHolidays = holidays.reduce((acc, holiday)=>{
          const type = holiday.holiday_type;
          if(!acc[type]){
            acc[type] = [];
          }
          acc[type].push({
            id: holiday._id,
            holiday_name: holiday.holiday_name,
            holiday_date: moment(holiday.start_date).format('ddd, DD MMMM, YYYY'),
            start_date: holiday.start_date,
            end_date: holiday.end_date,
            location: holiday.location,
          });
          return acc;
        }, {});
        return Object.entries(groupedHolidays).map(([type, holidays])=>({
          holiday_type: type,
          holidays: holidays
        }));
      }

      static async dashboardFormat(holiday) {
        return {
          holiday_id: holiday._id,
          holiday_name: holiday.holiday_name,
          holiday_date: moment(holiday.start_date).format('ddd, DD MMMM, YYYY'),
        };
      }
      
  }
  