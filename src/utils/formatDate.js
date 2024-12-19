export default class FormatDate{
/**
 * Formats an ISO date string to DD/MM/YYYY format.
 * @param {string} isoDate - The ISO date string to format.
 * @returns {string} - The formatted date in DD/MM/YYYY format.
 */
formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  weekDateFormat(isoDate){
    const date = new Date(isoDate);
    const options = { month: 'short', day: 'numeric' }; 
    return date.toLocaleDateString('en-US', options);
  }
}