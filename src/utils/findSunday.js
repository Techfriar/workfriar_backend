export default class FindSunday {
    
    // Get the next Sunday (including today if it's Sunday)
    async getNextSunday(date = new Date()) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // 0 if today is Sunday, else days to the next Sunday
        const nextSunday = new Date(date);
        nextSunday.setDate(date.getDate() + daysUntilSunday);
        return nextSunday;
    }
    
    async   getPreviousSunday(date = new Date()) {    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
            const daysSinceSunday = dayOfWeek === 0 ? 7 : dayOfWeek; // Calculate days since last Sunday    const previousSunday = new Date(date);
            previousSunday.setDate(date.getDate() - daysSinceSunday); // Move back to the last Sunday
            return previousSunday;}
}