import moment from 'moment-timezone';
/*
* @param {string} timezone - The timezone to use.
* @param {Date} date - The date to format (default is the current date).
* @returns {string} - The formatted date string in the specified timezone.
*/
export default function getLocalDateStringForTimezone(timezone, date = new Date()) {
    return moment.tz(date, timezone).startOf('day').toDate();
}