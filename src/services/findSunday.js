export default class FindSunday {
    
    // Get the next Sunday (including today if it's Sunday)
    async getNextSunday(date = new Date()) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // 0 if today is Sunday, else days to the next Sunday
        const nextSunday = new Date(date);
        nextSunday.setDate(date.getDate() + daysUntilSunday);
        return nextSunday;
    }
    static getPreviousSunday(date = new Date()) {    
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysSinceSunday = dayOfWeek; // Number of days since last Sunday
        const previousSunday = new Date(date); // Copy the provided date
        previousSunday.setDate(date.getDate() - daysSinceSunday); // Adjust to previous Sunday
        console.log(previousSunday, "Here is the previous Sunday");
        return previousSunday;
    }
    
}