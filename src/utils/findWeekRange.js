export default class FindWeekRange {
    /**
     * Get the start date of the week.
     * @param {Date} date - The reference date (default is the current date).
     * @returns {Date} - The week's start date.
     */
    getWeekStartDate(date = new Date()) {

        const firstDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfWeek = date.getDay(); // 0 = Sunday, ..., 6 = Saturday
        const daysSinceSunday = dayOfWeek === 0 ? 0 : dayOfWeek; // Days back to the nearest Sunday
        const previousSunday = new Date(date);
        previousSunday.setDate(date.getDate() - daysSinceSunday);

        // If the previous Sunday is before the start of the month, return the first day of the month
        return previousSunday < firstDayOfMonth ? firstDayOfMonth : previousSunday;
    }

    

    /**
     * Get the end date of the week.
     * @param {Date} weekStartDate - The start date of the week.
     * @returns {Date} - The week's end date.
     */
    getWeekEndDate(date = new Date()) {
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of the month
        const dayOfWeek = date.getDay(); // Day of the week (0 = Sunday, ..., 6 = Saturday)
        const daysUntilSaturday = dayOfWeek === 6 ? 0 : 6 - dayOfWeek; // Days forward to Saturday

        const nextSaturday = new Date(date); // Create a copy of the date
        nextSaturday.setDate(date.getDate() + daysUntilSaturday); // Move to the next Saturday

        // Return the earlier of nextSaturday or lastDayOfMonth, ensuring correct time handling
        return nextSaturday.getTime() > lastDayOfMonth.getTime() ? lastDayOfMonth : nextSaturday;
    }

    /**
     * Get both the week's start and end dates based on a given date.
     * @param {Date} date - The reference date (default is the current date).
     * @returns {Object} - An object with `weekStartDate` and `weekEndDate`.
     */
    getWeekRange(date = new Date()) {
        date.setHours(0, 0, 0, 0); // Set time to midnight
        const weekStartDate = this.getWeekStartDate(date);
        const weekEndDate = this.getWeekEndDate(weekStartDate);
        return { weekStartDate, weekEndDate };
    }

    normalizeToUTCDate = (date) => {
        const normalizedDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        return normalizedDate;
    };

    getDatesBetween(startDate, endDate) {
        const dates = [];
        let currentDate = this.normalizeToUTCDate(startDate)
        let end = this.normalizeToUTCDate(endDate)

        while (currentDate <= end) {
            dates.push(new Date(currentDate)); 
            currentDate = new Date(currentDate); 
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        return dates;
    }

}
