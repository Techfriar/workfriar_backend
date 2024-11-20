import moment from 'moment'

export default class LeasingUtils {
    // This is a static asynchronous function that calculates the leasing amount based on the validated data.
    static async calculateAmount(validatedData) {
        // Extract the start and end date strings from the validated data
        const startDateStr = validatedData.start_date
        const endDateStr = validatedData.end_date

        try {
            // Convert the start and end date strings to moment objects
            const startDate = moment(startDateStr, 'YYYY-MM-DD hh:ss')
            const endDate = moment(endDateStr, 'YYYY-MM-DD hh:mm').subtract(
                1,
                'minutes',
            )

            // Calculate the difference in days between the start and end dates
            const differenceInDays = endDate.diff(startDate, 'days') + 1

            // Initialize the amount variable to 0
            let amount = 0

            // Check if the difference in days is greater than 30
            if (differenceInDays > 30) {
                // If the leasing is recurring, set the number of months in range to 1
                // Otherwise, calculate the number of months in range by dividing the difference in days by 30
                const monthsInRange = validatedData.is_recurring
                    ? 1
                    : differenceInDays / 30 // Roughly assuming 30 days per month

                // Calculate the amount by multiplying the validated amount by the number of months in range
                amount = parseFloat(validatedData.amount) * monthsInRange
            } else {
                // If the difference in days is less than or equal to 30, calculate the number of months in range by dividing the difference in days by 30
                const monthsInRange = differenceInDays / 30

                // Calculate the amount by multiplying the validated amount by the number of months in range
                amount = parseFloat(validatedData.amount) * monthsInRange
            }

            //calculate total expected payment
            const monthsInRange = differenceInDays / 30
            const totalAmount = parseFloat(validatedData.amount) * monthsInRange

            // Return the calculated amount as a string with 2 decimal places
            const data = {
                amount: amount.toFixed(2),
                total_amount: totalAmount.toFixed(2),
            }
            return data
        } catch (error) {
            // If there is an error, throw a new error with the message 'Unable to calculate leasing amount'
            throw new Error('Unable to calculate leasing amount')
        }
    }

    // This is a static asynchronous function that calculates the leasing amount for recurring based on the validated data.
    static async calculateRecurringAmount(validatedData) {
        try {
            const startDateStr = validatedData.start_date
            const endeStr = validatedData.end_date

            // Convert the strings to moment objects
            const startDate = moment(startDateStr, 'YYYY-MM-DD hh:ss')
            const endDate = moment(endeStr, 'YYYY-MM-DD hh:mm').subtract(
                1,
                'minutes',
            )

            // Calculate the difference in days
            const differenceInDays = endDate.diff(startDate, 'days') + 1
            let amount = 0
            //calculate total expected payment
            const monthsInRange = differenceInDays / 30
            amount = parseFloat(validatedData.amount) * monthsInRange
            // Return the calculated amount as a string with 2 decimal places
            return amount.toFixed(2)
        } catch (error) {
            return false
        }
    }
}
