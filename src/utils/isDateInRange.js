export default class IsDateInRange{
    static isDateInRange(itemDate, startDate, endDate) {
        const parsedItemDate = new Date(itemDate);
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        // Check if the itemDate is within the range
        return parsedItemDate >= parsedStartDate && parsedItemDate <= parsedEndDate;
    }
}