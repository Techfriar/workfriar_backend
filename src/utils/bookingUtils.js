import moment from 'moment'
import SettingRepository from '../repositories/settingRepository.js'
import PricingRepository from '../repositories/pricingRepository.js'
import OptionalExtraRepository from '../repositories/optionalExtraRepository.js'
import PromoCodeRepository from '../repositories/promocodeRepository.js'
import VehicleRepository from '../repositories/vehicleRepository.js'
import BookingRepository from '../repositories/bookingRepository.js'
import BookingResponse from '../responses/bookingResponse.js'
import CustomerRepository from '../repositories/customerRepository.js'
import PaymentRepository from '../repositories/paymentRepository.js'
import Magnati from './magnati.js'
import GenerateUniqueId from './generateUniqueId.js'
import BookingTempRepository from '../repositories/bookingTempRepository.js'
import EmailRepository from '../repositories/emailRepository.js'
import BookingInvoiceRepository from '../repositories/bookingInvoiceRepository.js'
import BookingHistoryRepository from '../repositories/bookingHistoryRepository.js'
import { generateFileUrl } from './generateFileUrl.js'
import RefundRepository from '../repositories/refundRepository.js'
const settingsRepo = new SettingRepository()
const pricingRepo = new PricingRepository()
const optionalExtrasRepo = new OptionalExtraRepository()
const promocodeRepo = new PromoCodeRepository()
const vehicleRepo = new VehicleRepository()
const bookingRepo = new BookingRepository()
const customerRepo = new CustomerRepository()
const paymentRepo = new PaymentRepository()
const bookingTempRepo = new BookingTempRepository()
const emailRepo = new EmailRepository()
const bookingInvoiceRepo = new BookingInvoiceRepository()
const bookingHistoryRepo = new BookingHistoryRepository()
const refundRepo = new RefundRepository()
export default class BookingUtils {
    /**
     * Calculate Amount
     * @param {Map} validatedData
     * @returns calculatedAmount
     */
    static async calculateAmount(validatedData) {
        try {
            const pickUpDateStr = validatedData.pickup_date
            const returnDateStr = validatedData.return_date
            const paymentMode = validatedData.payment_mode

            // Convert the strings to moment objects
            const pickUpDate = moment(pickUpDateStr, 'YYYY-MM-DD hh:ss')
            const returnDate = moment(
                returnDateStr,
                'YYYY-MM-DD hh:mm',
            ).subtract(1, 'minutes')

            // Calculate the difference in days
            const differenceInDays = returnDate.diff(pickUpDate, 'days') + 1
            let priceType = null

            // Get VMD charge and tax values and VAT from settings
            const getVmd = await settingsRepo.getSettingByKey('vmd_charge')
            let vmd = getVmd.value
            const getTax = await settingsRepo.getSettingByKey('tax_value')
            // const getVat = await settingsRepo.getSettingByKey('vat_delivery')
            let tax = getTax.value
            // const VAT = parseFloat(getVat.value)
            //Get Vehicle
            const vehicle = await vehicleRepo.getVehicle(
                validatedData.vehicle_id,
            )

            let baseMileage = 0

            // Determine the excess mileage charge for the vehicle
            let excessMileageCharge
            // Check if the vehicle has a specified excess mileage charge
            if (vehicle.excess_mileage_charge) {
                excessMileageCharge = parseFloat(vehicle.excess_mileage_charge)
            } else {
                // If not, fetch the default excess mileage charge from settings
                const getExcessMileageCharge =
                    await settingsRepo.getSettingByKey('excess_mileage_charge')
                excessMileageCharge = parseFloat(getExcessMileageCharge.value)
            }

            // Determine the price type based on the duration of the booking
            if (differenceInDays < 7) {
                priceType = 'daily'
            } else if (differenceInDays >= 7 && differenceInDays < 30) {
                priceType = 'weekly'
            } else if (differenceInDays >= 30) {
                priceType = 'monthly'
                const monthlyBaseMileage = await settingsRepo.getSettingByKey(
                    'monthly_base_mileage',
                )
                baseMileage = parseFloat(monthlyBaseMileage.value)
            }

            // Retrieve pricing data based on vehicle ID, pick-up date, and determined price type
            const pricing = await pricingRepo.getPricingByConditions(
                validatedData.vehicle_id,
                validatedData.pickup_date,
                validatedData.return_date,
                priceType,
                validatedData.pick_up_location_id,
                validatedData.time_zone,
                validatedData.is_another_pick_up_location,
            )

            //monthly billing cycle
            const getMonthlyBillingCycle = await settingsRepo.getSettingByKey(
                'monthly_billing_cycle',
            )
            const monthlyBillingCycle = parseInt(getMonthlyBillingCycle.value)

            let totalPrice = 0 // Total price accumulator
            let pricePerRange // Price per range
            let basePrice = 0 // Base price, default to zero
            let depositFee = 0 // Initialize deposit fee to zero
            let tempPrice = 0
            let tempPricePerRange
            let firstBillingCyclePrice = 0 // Price of a first billing cycle
            let isRecurring = false
            let nextPayment = 0

            let onlinePrice = 0

            // Determine pricing based on price type and payment mode
            if (priceType === 'monthly' && validatedData.is_deposit_fee) {
                // Monthly pricing with deposit fee

                onlinePrice = parseFloat(
                    pricing[0].price_online_monthly_with_deposite,
                )

                pricePerRange =
                    paymentMode === 'pay_at_location'
                        ? parseFloat(
                              pricing[0].price_offline_monthly_with_deposite,
                          )
                        : parseFloat(
                              pricing[0].price_online_monthly_with_deposite,
                          )
                tempPricePerRange =
                    paymentMode === 'online'
                        ? parseFloat(
                              pricing[0].price_offline_monthly_with_deposite,
                          )
                        : parseFloat(
                              pricing[0].price_online_monthly_with_deposite,
                          )
            } else if (
                priceType === 'monthly' &&
                !validatedData.is_deposit_fee
            ) {
                onlinePrice = parseFloat(
                    pricing[0].price_online_monthly_without_deposite,
                )

                pricePerRange =
                    paymentMode === 'pay_at_location'
                        ? parseFloat(
                              pricing[0].price_offline_monthly_without_deposite,
                          )
                        : parseFloat(
                              pricing[0].price_online_monthly_without_deposite,
                          )
                tempPricePerRange =
                    paymentMode === 'online'
                        ? parseFloat(
                              pricing[0].price_offline_monthly_without_deposite,
                          )
                        : parseFloat(
                              pricing[0].price_online_monthly_without_deposite,
                          )
            } else if (priceType === 'weekly') {
                onlinePrice = parseFloat(pricing[0].price_online_weekly)
                pricePerRange =
                    paymentMode === 'pay_at_location'
                        ? parseFloat(pricing[0].price_offline_weekly)
                        : parseFloat(pricing[0].price_online_weekly)
                tempPricePerRange =
                    paymentMode === 'online'
                        ? parseFloat(pricing[0].price_offline_weekly)
                        : parseFloat(pricing[0].price_online_weekly)
            } else {
                // Daily pricing

                onlinePrice = parseFloat(pricing[0].price_online_daily)

                pricePerRange =
                    paymentMode === 'pay_at_location'
                        ? parseFloat(pricing[0].price_offline_daily)
                        : parseFloat(pricing[0].price_online_daily)
                tempPricePerRange =
                    paymentMode === 'online'
                        ? parseFloat(pricing[0].price_offline_daily)
                        : parseFloat(pricing[0].price_online_daily)
            }

            //calculate deposit fee
            // Check if vehicle has a specified deposit fee
            if (validatedData.is_deposit_fee && priceType === 'monthly') {
                if (vehicle.deposite_fee) {
                    depositFee = parseFloat(vehicle.deposite_fee)
                } else {
                    // Fetch default deposit fee from settings
                    const getDepositFee = await settingsRepo.getSettingByKey(
                        'deposite_charge',
                    )
                    depositFee = parseFloat(getDepositFee.value)
                }
            }

            // Calculate total price based on pricing type (daily, weekly, monthly)
            if (pricing[0]) {
                if (pricing[0].is_daily && priceType == 'daily') {
                    // If the pricing type is daily, calculate the total price and temporary price by multiplying the price per range with the difference in days
                    totalPrice += pricePerRange * differenceInDays
                    tempPrice += tempPricePerRange * differenceInDays
                } else if (pricing[0].is_weekly && priceType == 'weekly') {
                    // If the pricing type is weekly, calculate the total price and temporary price
                    // by multiplying the price per range with the number of weeks in the range
                    const weeksInRange = differenceInDays / 7
                    totalPrice += pricePerRange * weeksInRange
                    tempPrice += tempPricePerRange * weeksInRange
                } else if (pricing[0].is_monthly && priceType == 'monthly') {
                    // Update monthly calculation based on monthlyBillingCycle
                    const monthsInRange = differenceInDays / monthlyBillingCycle
                    if (monthlyBillingCycle < differenceInDays && paymentMode === 'online') {
                        isRecurring = true
                        // Calculate first billing cycle price
                        firstBillingCyclePrice += pricePerRange
                    }
                    totalPrice += pricePerRange * monthsInRange
                    tempPrice += tempPricePerRange * monthsInRange
                    nextPayment += pricePerRange
                }
            }

            basePrice = totalPrice

            // Initialize delivery price to zero
            let deliveryPrice = 0
            // Calculate delivery price based on pick-up location if it differs from the default location
            if (
                validatedData.is_another_pick_up_location &&
                validatedData.other_pickup_location
            ) {
                const deliverySetting = await settingsRepo.getSettingByKey(
                    'delivery_charge',
                )
                deliveryPrice += parseInt(deliverySetting.value)
                // deliveryPrice += VAT
            }

            // Calculate delivery price based on drop-off location if it differs from the pick-up location
            if (
                validatedData.is_another_drop_off_location &&
                validatedData.other_dropoff_location
            ) {
                const deliverySetting = await settingsRepo.getSettingByKey(
                    'delivery_charge',
                )
                deliveryPrice += parseInt(deliverySetting.value)
                // deliveryPrice += VAT
            }

            // Handle optional extras: If there are optional extras selected, fetch their details and calculate total price.
            if (validatedData.optional_extras?.length > 0) {
                // Map through the optional extras and process each one asynchronously
                await Promise.all(
                    validatedData.optional_extras.map(async (extras) => {
                        // Get the optional extra details based on the provided ID
                        const optionalExtra =
                            await optionalExtrasRepo.getOptionalExtra(
                                extras.optional_extras_id,
                            )

                        // Add the amount of the optional extra to the total price
                        totalPrice += parseFloat(optionalExtra.amount)
                        nextPayment += parseFloat(optionalExtra.amount)

                        // Add the amount of the optional extra to the temporary price
                        tempPrice += parseFloat(optionalExtra.amount)
                        onlinePrice += parseFloat(optionalExtra.amount)

                        // Add the amount of the optional extra to the first billing cycle price
                        firstBillingCyclePrice += parseFloat(
                            optionalExtra.amount,
                        )
                    }),
                )
            }

            // Calculate additional mileage charge if applicable
            let totalExcessCharge = 0
            if (
                validatedData.additional_mileage > 0 &&
                priceType == 'monthly'
            ) {
                // Calculate total excess charge by multiplying additional mileage with excess mileage charge
                totalExcessCharge =
                    (parseFloat(validatedData.additional_mileage) / 500) *
                    excessMileageCharge
                totalPrice += totalExcessCharge // Add total excess charge to the total price
                onlinePrice += totalExcessCharge
                nextPayment += totalExcessCharge
                tempPrice += totalExcessCharge // Add total excess charge to the temp price
                firstBillingCyclePrice += totalExcessCharge // Add total excess charge to the first billing cycle price
            }
    
            // Add delivery price and VMD to the total price and temp price and first billing cycle price.
            totalPrice += parseFloat(deliveryPrice)
            tempPrice += parseFloat(deliveryPrice)
            onlinePrice += parseFloat(deliveryPrice)
            firstBillingCyclePrice += parseFloat(deliveryPrice)

            if (vmd == undefined || vmd < 1) {
                vmd = 0
            }
            totalPrice += parseFloat(vmd)
            tempPrice += parseFloat(vmd)
            onlinePrice += parseFloat(vmd)
            firstBillingCyclePrice += parseFloat(vmd)

            totalPrice += depositFee
            tempPrice += depositFee
            onlinePrice += depositFee
            firstBillingCyclePrice += depositFee
    
            let discountAmount
            let discountType
            let priceBeforeDiscount = totalPrice
    
            // If a promotional code has been validated and exists
            if (
                validatedData.promocode &&
                validatedData.promocode !== 'exchange'
            ) {
                // Retrieve the promotional code details from the repository
                const getPromocode = await promocodeRepo.getPromocode({
                    promocode: validatedData.promocode,
                })

                // Set the discount amount and type based on the promotional code
                discountAmount = getPromocode.discount_value
                discountType = getPromocode.discount_type

                // Check if the discount type is 'fixed'
                if (getPromocode.discount_type == 'fixed') {
                    // Calculate the new total price, temporary price, and first billing cycle price
                    // by subtracting the fixed discount value from the original prices
                    totalPrice = Math.max(totalPrice - parseFloat(getPromocode.discount_value), 0)
                    onlinePrice = Math.max(onlinePrice - parseFloat(getPromocode.discount_value), 0)
                    tempPrice = Math.max(tempPrice - parseFloat(getPromocode.discount_value), 0)
                    firstBillingCyclePrice = Math.max(firstBillingCyclePrice - parseFloat(getPromocode.discount_value), 0)
                    nextPayment = Math.max(nextPayment - parseFloat(getPromocode.discount_value), 0)
                }
                // Check if the discount type is 'percentage'
                else if (getPromocode.discount_type == 'percentage') {
                    // Calculate the new total price, temporary price, and first billing cycle price
                    // by subtracting the percentage discount value from the original prices
                    const discountPercentage = parseFloat(getPromocode.discount_value) / 100
                    totalPrice = Math.max(totalPrice * (1 - discountPercentage), 0)
                    onlinePrice = Math.max(onlinePrice * (1 - discountPercentage), 0)
                    tempPrice = Math.max(tempPrice * (1 - discountPercentage), 0)
                    firstBillingCyclePrice = Math.max(firstBillingCyclePrice * (1 - discountPercentage), 0)
                    nextPayment = Math.max(nextPayment * (1 - discountPercentage), 0)
                }
            }
    
            // Calculate tax after applying the promo code
            const taxValue = totalPrice * (tax / 100)
            totalPrice += taxValue
    
            const onlineTaxValue = onlinePrice * (tax / 100)
            onlinePrice += onlineTaxValue
    
            const tempTaxValue = tempPrice * (tax / 100)
            tempPrice += tempTaxValue
    
            const firstBillingCycleTaxValue = firstBillingCyclePrice * (tax / 100)
            firstBillingCyclePrice += firstBillingCycleTaxValue
    
            const nextPaymentTaxValue = nextPayment * (tax / 100)
            nextPayment += nextPaymentTaxValue

            // Prepare data object with calculated prices.
            const data = {
                sub_total: totalPrice.toFixed(2),
                price: isRecurring
                    ? firstBillingCyclePrice.toFixed(2)
                    : totalPrice.toFixed(2),
                delivery_charge: deliveryPrice.toFixed(2),
                tax: taxValue,
                vmd: vmd,
                base_mileage: baseMileage,
                excess_charge: totalExcessCharge,
                base_price: basePrice.toFixed(2),
                rental_price: (totalPrice - taxValue).toFixed(2),
                deposit_fee: depositFee,
                pricing_type: priceType,
                discount_amount: discountAmount,
                discount_type: discountType,
                is_recurring: isRecurring,
                price_before_discount: priceBeforeDiscount.toFixed(2),
                next_payment: nextPayment.toFixed(2),
                is_flash_sale: pricing[0].is_flash_sale ?? false,
                pricing_id: pricing[0]._id,
                priority_price: (() => {
                    if (validatedData.payment_mode === 'online') {
                        if (priceType === 'monthly') {
                            return validatedData.is_deposit_fee
                                ? pricing[0].price_online_monthly_with_deposite
                                : pricing[0]
                                      .price_online_monthly_without_deposite
                        } else if (priceType === 'weekly') {
                            return pricing[0].price_online_weekly
                        } else if (priceType === 'daily') {
                            return pricing[0].price_online_daily
                        }
                    } else {
                        if (priceType === 'monthly') {
                            return validatedData.is_deposit_fee
                                ? pricing[0].price_offline_monthly_with_deposite
                                : pricing[0]
                                      .price_offline_monthly_without_deposite
                        } else if (priceType === 'weekly') {
                            return pricing[0].price_offline_weekly
                        } else if (priceType === 'daily') {
                            return pricing[0].price_offline_daily
                        }
                    }
                })(),
            }

            // Determine pricing based on payment mode and include online and offline prices accordingly
            if (paymentMode === 'pay_at_location') {
                data.online_price = tempPrice.toFixed(2)
                data.offline_price = totalPrice.toFixed(2)
            } else {
                data.offline_price = tempPrice.toFixed(2)
                data.online_price = isRecurring
                    ? firstBillingCyclePrice.toFixed(2)
                    : totalPrice.toFixed(2)
                // Calculate and include savings if payment mode is 'online'
                data.savings = (tempPrice - totalPrice).toFixed(2)
                data.is_recurring = isRecurring
            }
            return data
        } catch (error) {
            console.log(error)
            return false
        }
    }

    /**
     * Calculate Recurring Amount
     * @param {Map} validatedData
     * @returns calculatedAmount
     */
    static async calculateRecurringAmount(validatedData) {
        try {
            const pickUpDateStr = validatedData.pickup_date
            const returnDateStr = validatedData.return_date

            // Convert the strings to moment objects
            const pickUpDate = moment(pickUpDateStr, 'YYYY-MM-DD hh:ss')
            const returnDate = moment(
                returnDateStr,
                'YYYY-MM-DD hh:mm',
            ).subtract(1, 'minutes')

            // Calculate the difference in days
            const differenceInDays = returnDate.diff(pickUpDate, 'days') + 1
            let priceType = 'monthly'
            // Get tax values from settings
            const getTax = await settingsRepo.getSettingByKey('tax_value')
            let tax = getTax.value

            //Get Vehicle
            const vehicle = await vehicleRepo.getVehicle(
                validatedData.vehicle_id,
            )

            let baseMileage = 0

            // Determine the excess mileage charge for the vehicle
            let excessMileageCharge
            // Check if the vehicle has a specified excess mileage charge
            if (vehicle.excess_mileage_charge) {
                excessMileageCharge = parseFloat(vehicle.excess_mileage_charge)
            } else {
                // If not, fetch the default excess mileage charge from settings
                const getExcessMileageCharge =
                    await settingsRepo.getSettingByKey('excess_mileage_charge')
                excessMileageCharge = parseFloat(getExcessMileageCharge.value)
            }

            let totalPrice = 0 // Total price accumulator
            let basePrice = 0 // Base price, default to zero

            const monthsInRange = differenceInDays / 30 // Roughly assuming 30 days per month

            //Find base price
            basePrice =
                validatedData.base_amount &&
                validatedData.base_amount > 0 &&
                validatedData.base_amount / monthsInRange

            totalPrice += basePrice
            // Handle optional extras: If there are optional extras selected, fetch their details and calculate total price.
            if (validatedData.optional_extras.length > 0) {
                await Promise.all(
                    validatedData.optional_extras.map(async (extras) => {
                        const optionalExtra =
                            await optionalExtrasRepo.getOptionalExtra(
                                extras.optional_extras_id,
                            )
                        totalPrice += parseFloat(optionalExtra.amount)
                    }),
                )
            }
            // Calculate additional mileage charge if applicable
            let totalExcessCharge = 0
            if (
                validatedData.additional_mileage > 0 &&
                priceType == 'monthly'
            ) {
                // Calculate total excess charge by multiplying additional mileage with excess mileage charge
                totalExcessCharge =
                    parseFloat(validatedData.additional_mileage) *
                    excessMileageCharge
                totalPrice += totalExcessCharge // Add total excess charge to the total price
            }
            //Tax Calculations
            const taxValue = parseFloat(totalPrice) * (tax / 100)
            totalPrice += parseFloat(taxValue)
            // Prepare data object with calculated prices.
            const data = {
                price: totalPrice.toFixed(2),
                tax: taxValue.toFixed(2),
                base_mileage: baseMileage,
                excess_charge: totalExcessCharge,
                base_price: basePrice.toFixed(2),
                pricing_type: priceType,
            }

            return data
        } catch (error) {
            return false
        }
    }

    /**
     * Convert To 24 Hour
     * @param {string} time12h
     * @returns string time24h
     */
    static async convertTo24Hour(time12h) {
        const [time, period] = time12h.split(' ')
        let [hours, minutes] = time.split(':').map(Number)

        if (period === 'PM' && hours < 12) {
            hours += 12
        } else if (period === 'AM' && hours === 12) {
            hours = 0
        }

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
            2,
            '0',
        )}`
    }

    /**
     * Convert To 24 Hour with disabled minute
     * @param {string} time12h
     * @returns string time24h
     */
    static async convertTo24HourWithDisabledMinute(time12h, disableMinute) {
        const [time, period] = time12h.split(' ')
        let [hours, minutes] = time.split(':').map(Number)

        if (period === 'PM' && hours < 12) {
            hours += 12
        } else if (period === 'AM' && hours === 12) {
            hours = 0
        }

        return disableMinute
            ? String(hours).padStart(2, '0')
            : String(minutes).padStart(2, '0')
    }

    /**
     * Process Pay At Location Booking
     * @param {*} validatedData
     * @param {*} booking
     * @param {*} calculatedAmount
     */
    static async processPayAtLocationBookingUpdate(
        validatedData,
        booking,
        calculatedAmount,
    ) {
        let response = {}
        let data
        // Process pay at location booking logic
        if (
            parseFloat(calculatedAmount.sub_total) > parseFloat(booking.amount)
        ) {
            //request remaining amount
            const bookingDetails = await bookingRepo.updateBooking(
                validatedData,
            )
            if (bookingDetails) {
                /**
                 * Update Customer Billing Address
                 */
                await customerRepo.updateCustomerBillingAddress({
                    id: bookingDetails.customer_id,
                    billing_address: validatedData.billing_address,
                })
                await emailRepo.bookingEmail(
                    bookingDetails,
                    validatedData.time_zone,
                    true,
                )
                data = await BookingResponse.format(bookingDetails)
                const invoice = await bookingRepo.generateInvoice(data)

                if (invoice) {
                    //Add Booking Invoice
                    const addBookingInvoice =
                        await bookingInvoiceRepo.addBookingInvoice({
                            booking_id: bookingDetails._id,
                            invoice_path: invoice,
                        })

                    //Add Booking Invoice
                    await bookingHistoryRepo.addBookingHistory({
                        booking_id: addBookingInvoice.booking_id,
                        invoice_id: addBookingInvoice._id,
                        action: 'update',
                    })
                    //Add Invoice Path to data
                    data.invoice_path = generateFileUrl(invoice)
                }
                response = {
                    status: true,
                    message: 'Booking updated successfully',
                    type: 'request_remaining_offline',
                    data: data,
                }
            } else {
                response = {
                    status: false,
                    message: 'Failed to update booking',
                    data: [],
                }
            }
        } else if (
            parseFloat(calculatedAmount.sub_total) < parseFloat(booking.amount)
        ) {
            // initiateRefund
            const bookingDetails = await bookingRepo.updateBooking(
                validatedData,
            )
            if (bookingDetails) {
                await customerRepo.updateCustomerBillingAddress({
                    id: bookingDetails.customer_id,
                    billing_address: validatedData.billing_address,
                })
                await emailRepo.bookingEmail(
                    bookingDetails,
                    validatedData.time_zone,
                    true,
                )
                data = await BookingResponse.format(bookingDetails)
                const refundAmount =
                    parseFloat(booking.initial_payment) -
                    parseFloat(calculatedAmount.price)
                validatedData.type = 'customer_requested'
                validatedData.paid_amount = parseFloat(booking.initial_payment)
                validatedData.actual_amount = refundAmount
                validatedData.proposed_amount = refundAmount
                validatedData.proposed_reason = ''
                validatedData.cancellation_charge = 0
                validatedData.refund_type = 'booking_update'
                validatedData.booking_id = booking._id
                validatedData.booking_proposed_amount = refundAmount

                await refundRepo.addRefund(validatedData)
                const invoice = await bookingRepo.generateInvoice(data)

                if (invoice) {
                    //Add Booking Invoice
                    const addBookingInvoice =
                        await bookingInvoiceRepo.addBookingInvoice({
                            booking_id: bookingDetails._id,
                            invoice_path: invoice,
                        })

                    //Add Booking Invoice
                    await bookingHistoryRepo.addBookingHistory({
                        booking_id: addBookingInvoice.booking_id,
                        invoice_id: addBookingInvoice._id,
                        action: 'update',
                    })
                    //Add Invoice Path to data
                    data.invoice_path = generateFileUrl(invoice)
                }
                response = {
                    status: true,
                    message: 'Booking updated successfully',
                    type: 'refund_offline',
                    data: data,
                }
            } else {
                response = {
                    status: false,
                    message: 'Failed to update booking',
                    data: [],
                }
            }
        } else if (
            parseFloat(calculatedAmount.sub_total) == parseFloat(booking.amount)
        ) {
            // No amount changes, update the booking
            const bookingDetails = await bookingRepo.updateBooking(
                validatedData,
            )
            if (bookingDetails) {
                /**
                 * Update Customer Billing Address
                 */
                await customerRepo.updateCustomerBillingAddress({
                    id: bookingDetails.customer_id,
                    billing_address: validatedData.billing_address,
                })
                await emailRepo.bookingEmail(
                    bookingDetails,
                    validatedData.time_zone,
                    true,
                )
                data = await BookingResponse.format(bookingDetails)
                response = {
                    status: true,
                    message: 'Booking updated successfully',
                    type: 'no_amount_changes',
                    data: data,
                }
            } else {
                response = {
                    status: false,
                    message: 'Failed to update booking',
                    data: [],
                }
            }
        }
        return response
    }

    /**
     * Process Online Booking Update
     * @param {*} validatedData
     * @param {*} booking
     * @param {*} calculatedAmount
     */
    static async processOnlineBookingUpdate(
        validatedData,
        booking,
        calculatedAmount,
        actioned_by,
    ) {
        let response = {}
        let data
        // Process online booking logic
        if (booking.is_recurring) {
            if (
                parseFloat(calculatedAmount.price) >
                parseFloat(booking.initial_payment)
            ) {
                //request remaining amount
                const remainingAmount =
                    parseFloat(calculatedAmount.price) -
                    parseFloat(booking?.initial_payment)

                /**
                 * Fetch recurring_registration transaction
                 */
                const payment = await paymentRepo.getPaymentWithTransactionType(
                    booking._id,
                    'recurring_registration',
                )
                const orderId = GenerateUniqueId.generate(14)
                /** Request Payment  */
                const requestPayment = await Magnati.recurringPayment({
                    order_id: orderId,
                    amount: calculatedAmount.price,
                    transaction_id: payment.transaction_id,
                })
                if (requestPayment.ResponseCode == '0') {
                    await paymentRepo.addPayment({
                        status: 'success',
                        date: new Date(),
                        order_id: GenerateUniqueId.generate(14),
                        comment: 'Payment Success',
                        actioned_by: actioned_by,
                        actioned_type: 'Customer',
                        booking_id: booking._id,
                        customer_id: booking.customer_id,
                        vehicle_id: booking.vehicle_id,
                        amount: remainingAmount,
                        type: 'credit',
                        transaction_type: 'update_recurring_success',
                        gateway_response: requestPayment.ResponseDescription,
                        parrent_id: payment._id,
                        is_update: true,
                        card_type: payment.card_type,
                        card_number: payment.card_number,
                        card_brand: payment.card_brand,
                        mode: 'booking',
                    })
                    const bookingDetails = await bookingRepo.updateBooking(
                        validatedData,
                    )
                    if (bookingDetails) {
                        await customerRepo.updateCustomerBillingAddress({
                            id: bookingDetails.customer_id,
                            billing_address: validatedData.billing_address,
                        })
                        data = await BookingResponse.format(bookingDetails)
                        const invoice = await bookingRepo.generateInvoice(data)

                        if (invoice) {
                            //Add Booking Invoice
                            const addBookingInvoice =
                                await bookingInvoiceRepo.addBookingInvoice({
                                    booking_id: bookingDetails._id,
                                    invoice_path: invoice,
                                })

                            //Add Booking Invoice
                            await bookingHistoryRepo.addBookingHistory({
                                booking_id: addBookingInvoice.booking_id,
                                invoice_id: addBookingInvoice._id,
                                action: 'update',
                            })
                            //Add Invoice Path to data
                            data.invoice_path = generateFileUrl(invoice)
                        }
                        await emailRepo.bookingEmail(
                            bookingDetails,
                            validatedData.time_zone,
                            true,
                        )
                        response = {
                            status: true,
                            message: 'Booking updated successfully.',
                            type: 'recurring_payment_success',
                            data: data,
                        }
                    } else {
                        response = {
                            status: false,
                            message: 'Failed to update booking',
                            data: [],
                        }
                    }
                } else {
                    await paymentRepo.addPayment({
                        status: 'failed',
                        date: new Date(),
                        order_id: GenerateUniqueId.generate(14),
                        comment: 'Payment Failed',
                        actioned_by: actioned_by,
                        actioned_type: 'Customer',
                        booking_id: booking._id,
                        customer_id: booking.customer_id,
                        vehicle_id: booking.vehicle_id,
                        amount: remainingAmount,
                        type: 'credit',
                        transaction_type: 'update_recurring_failed',
                        gateway_response: requestPayment.ResponseDescription,
                        parrent_id: payment._id,
                        is_update: true,
                        card_type: payment.card_type,
                        card_number: payment.card_number,
                        card_brand: payment.card_brand,
                        mode: 'booking',
                    })
                    response = {
                        status: false,
                        message: `Booking failed,${requestPayment.ResponseDescription}`,
                        type: 'insufficiant_balance',
                        data: data,
                    }
                }
            } else if (
                parseFloat(calculatedAmount.price) <
                parseFloat(booking.initial_payment)
            ) {
                // initiateRefund
                const refundAmount =
                    parseFloat(booking.initial_payment) -
                    parseFloat(calculatedAmount.price)
                if (refundAmount > 0) {
                    validatedData.type = 'customer_requested'
                    validatedData.paid_amount = parseFloat(
                        booking.initial_payment,
                    )
                    validatedData.actual_amount = refundAmount
                    validatedData.proposed_amount = refundAmount
                    validatedData.proposed_reason = ''
                    validatedData.cancellation_charge = 0
                    validatedData.refund_type = 'booking_update'
                    validatedData.booking_id = booking._id
                    validatedData.booking_proposed_amount = refundAmount

                    await refundRepo.addRefund(validatedData)

                    const bookingDetails = await bookingRepo.updateBooking(
                        validatedData,
                    )
                    if (bookingDetails) {
                        await customerRepo.updateCustomerBillingAddress({
                            id: bookingDetails.customer_id,
                            billing_address: validatedData.billing_address,
                        })
                        await emailRepo.bookingEmail(
                            bookingDetails,
                            validatedData.time_zone,
                            true,
                        )
                        data = await BookingResponse.format(bookingDetails)
                        const invoice = await bookingRepo.generateInvoice(data)

                        if (invoice) {
                            //Add Booking Invoice
                            const addBookingInvoice =
                                await bookingInvoiceRepo.addBookingInvoice({
                                    booking_id: bookingDetails._id,
                                    invoice_path: invoice,
                                })

                            //Add Booking Invoice
                            await bookingHistoryRepo.addBookingHistory({
                                booking_id: addBookingInvoice.booking_id,
                                invoice_id: addBookingInvoice._id,
                                action: 'update',
                            })
                            //Add Invoice Path to data
                            data.invoice_path = generateFileUrl(invoice)
                        }
                        response = {
                            status: true,
                            message:
                                'Booking updated successfully and refund issued.',
                            type: 'refund_online',
                            data: data,
                            refund_amount: refundAmount > 0 ? refundAmount : 0,
                        }
                    } else {
                        response = {
                            status: false,
                            message: 'Failed to update booking',
                            data: [],
                        }
                    }
                }
            } else if (
                parseFloat(calculatedAmount.price) ==
                parseFloat(booking.initial_payment)
            ) {
                // No amount changes, update the booking
                const bookingDetails = await bookingRepo.updateBooking(
                    validatedData,
                )
                if (bookingDetails) {
                    /**
                     * Update Customer Billing Address
                     */
                    await customerRepo.updateCustomerBillingAddress({
                        id: bookingDetails.customer_id,
                        billing_address: validatedData.billing_address,
                    })
                    await emailRepo.bookingEmail(
                        bookingDetails,
                        validatedData.time_zone,
                        true,
                    )
                    data = await BookingResponse.format(bookingDetails)
                    const invoice = await bookingRepo.generateInvoice(data)

                    if (invoice) {
                        //Add Booking Invoice
                        const addBookingInvoice =
                            await bookingInvoiceRepo.addBookingInvoice({
                                booking_id: bookingDetails._id,
                                invoice_path: invoice,
                            })

                        //Add Booking Invoice
                        await bookingHistoryRepo.addBookingHistory({
                            booking_id: addBookingInvoice.booking_id,
                            invoice_id: addBookingInvoice._id,
                            action: 'update',
                        })
                        //Add Invoice Path to data
                        data.invoice_path = generateFileUrl(invoice)
                    }
                    response = {
                        status: true,
                        message: 'Booking updated successfully',
                        type: 'no_amount_changes',
                        data: data,
                    }
                } else {
                    response = {
                        status: false,
                        message: 'Failed to update booking',
                        data: [],
                    }
                }
            }
        } else if (!booking.is_recurring) {
            if (
                parseFloat(calculatedAmount.sub_total) >
                parseFloat(booking.amount)
            ) {
                //request remaining amount
                const remainingAmount = calculatedAmount.is_recurring
                    ? parseFloat(calculatedAmount.price) -
                      parseFloat(booking?.amount)
                    : parseFloat(calculatedAmount.sub_total) -
                      parseFloat(booking?.amount)
                if (remainingAmount > 0) {
                    const orderId = GenerateUniqueId.generate(14)
                    let magnatiInit
                    if (calculatedAmount.is_recurring) {
                        magnatiInit = await Magnati.recurringRegistration(
                            {
                                order_id: orderId,
                                amount: remainingAmount,
                                customer_name: booking?.customer_id?.name,
                                description: booking?.vehicle_id?.title,
                            },
                            true,
                        )
                    } else {
                        magnatiInit = await Magnati.initPayment(
                            {
                                order_id: orderId,
                                amount: remainingAmount,
                                customer_name: booking?.customer_id?.name,
                            },
                            true,
                        )
                    }
                    const payment = await paymentRepo.getPaymentWithBookingId(
                        booking._id,
                    )

                    validatedData.transaction_id = magnatiInit.TransactionID
                    //Add payment details
                    const addPayment = await paymentRepo.addPayment({
                        status: 'pending',
                        date: new Date(),
                        order_id: orderId,
                        comment: 'Booking',
                        actioned_by: actioned_by,
                        actioned_type: 'Customer',
                        booking_id: booking._id,
                        customer_id: booking.customer_id,
                        vehicle_id: booking.vehicle_id,
                        amount: remainingAmount,
                        transaction_id: magnatiInit.TransactionID,
                        type: 'credit',
                        transaction_type: calculatedAmount.is_recurring
                            ? 'recurring_registration'
                            : 'payment_init',
                        gateway_response: magnatiInit.ResponseDescription,
                        is_update: true,
                        card_type: payment.card_type,
                        card_number: payment.card_number,
                        card_brand: payment.card_brand,
                        mode: 'booking',
                    })

                    //add booking temp
                    await bookingTempRepo.addBookingTemp({
                        customer_id: booking.customer_id,
                        status: booking.status,
                        payment_mode: booking.payment_mode,
                        amount: calculatedAmount.sub_total,
                        initial_payment: calculatedAmount.price,
                        optional_extras: validatedData.optional_extras,
                        pick_up_location_id: validatedData.pick_up_location_id,
                        drop_off_location_id:
                            validatedData.drop_off_location_id,
                        is_another_pick_up_location:
                            validatedData.is_another_pick_up_location,
                        is_another_drop_off_location:
                            validatedData.is_another_drop_off_location,
                        pickup_date: validatedData.pickup_date,
                        return_date: validatedData.return_date,
                        additional_mileage: validatedData.additional_mileage,
                        billing_address: validatedData.billing_address,
                        promocode: validatedData.promocode,
                        remarks: validatedData.remarks,
                        card_holder: validatedData.card_holder,
                        actioned_by: actioned_by,
                        actioned_type: 'Customer',
                        vehicle_id: booking.vehicle_id,
                        deposit_fee: calculatedAmount.deposit_fee,
                        mileage_excess_charge: calculatedAmount.excess_charge,
                        delivery_charge: calculatedAmount.delivery_charge,
                        tax: calculatedAmount.tax,
                        vmd: calculatedAmount.vmd,
                        base_mileage: calculatedAmount.base_mileage,
                        booking_id: booking._id,
                        payment_id: addPayment._id,
                        is_recurring: calculatedAmount.is_recurring,
                        next_payments: validatedData.next_payments,
                    })
                    if (magnatiInit) {
                        response = {
                            status: true,
                            message: 'Payment Initiated Successfully.',
                            type: 'request_remaining_online',
                            payment_portal: magnatiInit.PaymentPortal,
                            data: {
                                payment_mode: booking.payment_mode,
                                id: booking._id,
                            },
                        }
                    } else {
                        response = {
                            status: false,
                            message: 'Failed to initiate payment.',
                            data: [],
                        }
                    }
                }
            } else if (
                parseFloat(calculatedAmount.sub_total) ==
                parseFloat(booking.amount)
            ) {
                // No amount changes, update the booking
                const bookingDetails = await bookingRepo.updateBooking(
                    validatedData,
                )
                if (bookingDetails) {
                    /**
                     * Update Customer Billing Address
                     */
                    await customerRepo.updateCustomerBillingAddress({
                        id: bookingDetails.customer_id,
                        billing_address: validatedData.billing_address,
                    })
                    await emailRepo.bookingEmail(
                        bookingDetails,
                        validatedData.time_zone,
                        true,
                    )
                    data = await BookingResponse.format(bookingDetails)
                    const invoice = await bookingRepo.generateInvoice(data)

                    if (invoice) {
                        //Add Booking Invoice
                        const addBookingInvoice =
                            await bookingInvoiceRepo.addBookingInvoice({
                                booking_id: bookingDetails._id,
                                invoice_path: invoice,
                            })

                        //Add Booking Invoice
                        await bookingHistoryRepo.addBookingHistory({
                            booking_id: addBookingInvoice.booking_id,
                            invoice_id: addBookingInvoice._id,
                            action: 'update',
                        })
                        //Add Invoice Path to data
                        data.invoice_path = generateFileUrl(invoice)
                    }
                    response = {
                        status: true,
                        message: 'Booking updated successfully',
                        type: 'no_amount_changes',
                        data: data,
                    }
                } else {
                    response = {
                        status: false,
                        message: 'Failed to update booking',
                        data: [],
                    }
                }
            } else if (
                parseFloat(calculatedAmount.sub_total) <
                parseFloat(booking.amount)
            ) {
                //initiate refund
                const refundAmount =
                    parseFloat(booking.amount) -
                    parseFloat(calculatedAmount.sub_total)
                if (refundAmount > 0) {
                    validatedData.type = 'customer_requested'
                    validatedData.paid_amount = parseFloat(
                        booking.initial_payment,
                    )
                    validatedData.actual_amount = refundAmount
                    validatedData.proposed_amount = refundAmount
                    validatedData.proposed_reason = ''
                    validatedData.cancellation_charge = 0
                    validatedData.refund_type = 'booking_update'
                    validatedData.booking_id = booking._id
                    validatedData.booking_proposed_amount = refundAmount

                    await refundRepo.addRefund(validatedData)

                    const bookingDetails = await bookingRepo.updateBooking(
                        validatedData,
                    )
                    if (bookingDetails) {
                        await customerRepo.updateCustomerBillingAddress({
                            id: bookingDetails.customer_id,
                            billing_address: validatedData.billing_address,
                        })
                        await emailRepo.bookingEmail(
                            bookingDetails,
                            validatedData.time_zone,
                            true,
                        )
                        data = await BookingResponse.format(bookingDetails)
                        const invoice = await bookingRepo.generateInvoice(data)

                        if (invoice) {
                            //Add Booking Invoice
                            const addBookingInvoice =
                                await bookingInvoiceRepo.addBookingInvoice({
                                    booking_id: bookingDetails._id,
                                    invoice_path: invoice,
                                })

                            //Add Booking Invoice
                            await bookingHistoryRepo.addBookingHistory({
                                booking_id: addBookingInvoice.booking_id,
                                invoice_id: addBookingInvoice._id,
                                action: 'update',
                            })
                            //Add Invoice Path to data
                            data.invoice_path = generateFileUrl(invoice)
                        }

                        response = {
                            status: true,
                            message:
                                'Booking updated successfully and refund issued.',
                            type: 'refund_online',
                            data: data,
                            refund_amount: refundAmount > 0 ? refundAmount : 0,
                        }
                    } else {
                        response = {
                            status: false,
                            message: 'Failed to update booking',
                            data: [],
                        }
                    }
                }
            }
        }
        return response
    }

    /**
     * Get Dates in Range
     * @param {*} startDate
     * @param {*} endDate
     * @returns dates
     */
    static async getDatesInRange(startDate, endDate) {
        const dates = []
        let currentDate = startDate.clone()
        while (
            currentDate.isBefore(endDate) ||
            currentDate.isSame(endDate, 'day')
        ) {
            dates.push(currentDate.toDate())
            currentDate = currentDate.add(1, 'day')
        }
        return dates
    }
}
