export function getDateRangeAroundInput(inputDate, rangeCount, weekRanges) {
    const inputMoment = new Date(inputDate);
    const result = [];

    let found = false;
    

    for (let i = 0; i < weekRanges.length; i++) {
 
        const currentRange = weekRanges[i];
        const startDate = new Date(currentRange.startDate);
        const endDate = new Date(currentRange.endDate);
        
        if (inputMoment >= startDate && inputMoment <= endDate) {
            found = true;
            result.push(currentRange);  

            for (let j = i - 1; j >= 0 && result.length < rangeCount; j--) {
                result.unshift(weekRanges[j]);
            }
        
            for (let j = i + 1; j < weekRanges.length && result.length < rangeCount * 2; j++) {
                result.push(weekRanges[j]);
            }

            break;
        }
    }

    if (!found) {
        return []; 
    }
    return result;
}
