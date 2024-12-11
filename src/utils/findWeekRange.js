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

    // adjustWeekRange(startDate, endDate, prev, next) {

    //     const start = new Date(startDate);
    //     const end = new Date(endDate);

    //     if (prev && next) {
    //         return { startDate, endDate };
    //     }

    //     if (prev) {
    //         const prevEnd = new Date(start);
    //         prevEnd.setDate(start.getDate() - 1);

    //         const prevStart = new Date(prevEnd);

    //         const lastDayOfMonth = new Date(
    //             prevEnd.getFullYear(),
    //             prevEnd.getMonth() + 1,
    //             0
    //         ).getDate();

    //         if (prevEnd.getDate() === lastDayOfMonth) {
    //             console.log('1');

    //             const dayOfWeek = prevEnd.getDay();
    //             prevStart.setDate(prevEnd.getDate() - dayOfWeek);
    //         } else {
    //             console.log('2');

    //             prevStart.setDate(prevEnd.getDate() - 6);
    //         }
    //         if (prevStart.getMonth() !== prevEnd.getMonth()) {
    //             console.log('3', prevStart);

    //             prevStart.setFullYear(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
    //         }

    //         return {
    //             startDate: prevStart.toISOString().split('T')[0],
    //             endDate: prevEnd.toISOString().split('T')[0],
    //         };
    //     }

    //     if (next) {
    //         const nextStart = new Date(end);
    //         nextStart.setDate(end.getDate() + 1);
    
    //         let nextEnd = new Date(nextStart);
    //         nextEnd.setDate(nextStart.getDate() + 6);
    
    //         // Adjust nextEnd to the last day of the current month if it crosses month boundaries
    //         if (nextStart.getMonth() !== nextEnd.getMonth()) {
    //             const lastDayOfMonth = new Date(
    //                 nextStart.getFullYear(),
    //                 nextStart.getMonth() + 1, // Move to the next month
    //                 0 // Get the last day of the current month
    //             ).getDate();
    //             nextEnd.setDate(lastDayOfMonth);
    //         }
    
    //         // Ensure nextEnd stays within the same month as nextStart
    //         if (nextEnd.getMonth() !== nextStart.getMonth()) {
    //             nextEnd.setDate(1); // Reset to the first day of the next month
    //         }

    //         return {
    //             startDate: nextStart.toISOString().split('T')[0],
    //             endDate: nextEnd.toISOString().split('T')[0],
    //         };
    //     }


    //     return { startDate, endDate };
    // }

    adjustWeekRange(startDate, endDate, prev, next) {
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        if (prev && next || !prev && !next) {
            // If prev and next are either both true or both false, return the original dates
            return { startDate, endDate };
        }   

        if (prev) {
            const prevEnd = new Date(start);
            prevEnd.setDate(start.getDate() - 1);

            const prevStart = new Date(prevEnd);

            const lastDayOfMonth = new Date(
                prevEnd.getFullYear(),
                prevEnd.getMonth() + 1,
                0
            ).getDate();

            if (prevEnd.getDate() === lastDayOfMonth) {
                const dayOfWeek = prevEnd.getDay();
                prevStart.setDate(prevEnd.getDate() - dayOfWeek);
            } else { 
                prevStart.setDate(prevEnd.getDate() - 6);
            }
            if (prevStart.getMonth() !== prevEnd.getMonth()) {

                prevStart.setFullYear(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
            }

            return {
                startDate: prevStart.toISOString().split('T')[0],
                endDate: prevEnd.toISOString().split('T')[0],
            };
        }

        if (next) {
            const nextStart = new Date(end);
            nextStart.setDate(end.getDate() + 1);
    
            let nextEnd = new Date(nextStart);
            nextEnd.setDate(nextStart.getDate() + 6);
    
            // Adjust nextEnd to the last day of the current month if it crosses month boundaries
            if (nextStart.getMonth() !== nextEnd.getMonth()) {
                const lastDayOfMonth = new Date(
                    nextStart.getFullYear(),
                    nextStart.getMonth() + 1, 
                    0 
                ).getDate();
                nextEnd.setFullYear(nextStart.getFullYear(), nextStart.getMonth(), lastDayOfMonth);;
            }

            if (nextStart.getDate() === 1) {
                // If `nextStart` is at the start of the month, set `nextEnd` to the coming Saturday
                const dayOfWeek = nextStart.getDay(); 
                const daysUntilSaturday = (6 - dayOfWeek) % 7;
                nextEnd.setDate(nextStart.getDate() + daysUntilSaturday);
            }
   

            return {
                startDate: nextStart.toISOString().split('T')[0],
                endDate: nextEnd.toISOString().split('T')[0],
            };
        }
        
        
        return { startDate, endDate };
    }
    


}
