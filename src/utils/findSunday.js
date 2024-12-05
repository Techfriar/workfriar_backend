export default class FindSunday {
    
    // Get the next Sunday (including today if it's Sunday)
    async getNextSunday(date = new Date()) {
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // 0 if today is Sunday, else days to the next Sunday
        const nextSunday = new Date(date);
        nextSunday.setDate(date.getDate() + daysUntilSunday);
        return nextSunday;
    }

    static getPreviousSunday(date = new Date(), timezone = 'UTC') {
        const formattedDate = new Date(
            new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(date)
        );
        const dayOfWeek = formattedDate.getDay();

        if (dayOfWeek === 0) {
            return new Date(date.setUTCHours(0, 0, 0, 0));
        }
        const previousSunday = new Date(date); 
        previousSunday.setDate(date.getDate() - dayOfWeek);
        previousSunday.setUTCHours(0, 0, 0, 0);

        return previousSunday;
    }
    
    
    
}