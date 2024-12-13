function generateWeekDateRanges(yearsBefore = 3, yearsAfter = 1) {
    function getDetailedWeekRanges(fullStartDate, fullEndDate) {
        const ranges = [];
        
        // If the week spans two months
        if (fullStartDate.getMonth() !== fullEndDate.getMonth()) {
            // First range: from start of week to last day of first month
            const lastDayOfFirstMonth = new Date(fullStartDate.getFullYear(), fullStartDate.getMonth() + 1, 0);
            ranges.push({
                startDate: `${fullStartDate.getFullYear()}-${fullStartDate.getMonth() + 1}-${fullStartDate.getDate()}`,
                endDate: `${fullStartDate.getFullYear()}-${fullStartDate.getMonth() + 1}-${lastDayOfFirstMonth.getDate()}`
            });
            
            // Second range: from first day of second month to end of week
            ranges.push({
                startDate: `${fullEndDate.getFullYear()}-${fullEndDate.getMonth() + 1}-1`,
                endDate: `${fullEndDate.getFullYear()}-${fullEndDate.getMonth() + 1}-${fullEndDate.getDate()}`
            });
        } else {
            // If the week is within the same month
            ranges.push({
                startDate: `${fullStartDate.getFullYear()}-${fullStartDate.getMonth() + 1}-${fullStartDate.getDate()}`,
                endDate: `${fullEndDate.getFullYear()}-${fullEndDate.getMonth() + 1}-${fullEndDate.getDate()}`
            });
        }
        
        return ranges;
    }

    function getWeekStartEnd(date) {
        // Clone the date to avoid mutation
        const currentDate = new Date(date);
        
        // Adjust to Sunday (start of week)
        const dayOfWeek = currentDate.getDay();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
        
        // End of week is the following Saturday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return { 
            startDate: startOfWeek.getDate(), 
            endDate: endOfWeek.getDate(),
            fullStartDate: startOfWeek,
            fullEndDate: endOfWeek
        };
    }

    const currentYear = new Date().getFullYear();
    const weekRanges = [];

    // Calculate start and end years
    const startYear = currentYear - yearsBefore;
    const endYear = currentYear + yearsAfter;

    // Iterate through each year
    for (let year = startYear; year <= endYear; year++) {
        // Start from January 1st of the current year
        let currentDate = new Date(year, 0, 1);
        
        // Ensure we start on a Sunday
        while (currentDate.getDay() !== 0) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Generate weeks for the entire year
        while (currentDate.getFullYear() === year) {
            const { fullStartDate, fullEndDate } = getWeekStartEnd(currentDate);
            
            // Get detailed ranges for this week
            const detailedRanges = getDetailedWeekRanges(fullStartDate, fullEndDate);
            
            // Add these ranges to our results
            weekRanges.push(...detailedRanges);
            
            // Move to next week
            currentDate.setDate(currentDate.getDate() + 7);
        }
    }

    // Log full data to console
    console.log('Total Ranges:', weekRanges.length);
    console.log('Full Data:', JSON.stringify(weekRanges, null, 2));

    return weekRanges;
}


generateWeekDateRanges();