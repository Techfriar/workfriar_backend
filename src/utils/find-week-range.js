function generateWeekDateRanges(yearsBefore = 3, yearsAfter = 1) {
    function getDetailedWeekRanges(fullStartDate, fullEndDate) {
        const ranges = [];
        

        if (fullStartDate.getMonth() !== fullEndDate.getMonth()) {

            const lastDayOfFirstMonth = new Date(fullStartDate.getFullYear(), fullStartDate.getMonth() + 1, 0);
            ranges.push({
                startDate: `${fullStartDate.getFullYear()}-${fullStartDate.getMonth() + 1}-${fullStartDate.getDate()}`,
                endDate: `${fullStartDate.getFullYear()}-${fullStartDate.getMonth() + 1}-${lastDayOfFirstMonth.getDate()}`
            });
            
        
            ranges.push({
                startDate: `${fullEndDate.getFullYear()}-${fullEndDate.getMonth() + 1}-1`,
                endDate: `${fullEndDate.getFullYear()}-${fullEndDate.getMonth() + 1}-${fullEndDate.getDate()}`
            });
        } else {
   
            ranges.push({
                startDate: `${fullStartDate.getFullYear()}-${fullStartDate.getMonth() + 1}-${fullStartDate.getDate()}`,
                endDate: `${fullEndDate.getFullYear()}-${fullEndDate.getMonth() + 1}-${fullEndDate.getDate()}`
            });
        }
        
        return ranges;
    }

    function getWeekStartEnd(date) {
        const currentDate = new Date(date);
        
        const dayOfWeek = currentDate.getDay();
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
        
  
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

    const startYear = currentYear - yearsBefore;
    const endYear = currentYear + yearsAfter;


    for (let year = startYear; year <= endYear; year++) {
 
        let currentDate = new Date(year, 0, 1);

        while (currentDate.getDay() !== 0) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        while (currentDate.getFullYear() === year) {
            const { fullStartDate, fullEndDate } = getWeekStartEnd(currentDate);
            
     
            const detailedRanges = getDetailedWeekRanges(fullStartDate, fullEndDate);
    
            weekRanges.push(...detailedRanges);
 
            currentDate.setDate(currentDate.getDate() + 7);
        }
    }

    return weekRanges;
}

generateWeekDateRanges();