import moment from "moment";

export default class FormattedDates {
    /**
     * Transform the Dates.
     * @param {Array} dates - The array of date objects.
     * @return {Array} - An array of transformed date objects.
     */
    async formattedDateResponse(dates) {

        let index = 0;

        const data = dates.map((date) => {
            const startDate = moment(date.startDate);
            const endDate = moment(date.endDate);
            const label = `${startDate.format("MMM")} ${startDate.format("D")}-${endDate.format("MMM")} ${endDate.format("D")}, ${startDate.format("YYYY")}`;

            return {
                startDate: date.startDate,
                month: startDate.format("MMMM"),
                endDate: date.endDate,
                week: index++,
                label: label
            };
        });
        return data
  }
}
