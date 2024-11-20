// Import Axios for making HTTP requests
import axios from 'axios'

/**
 * Utility class for interacting with the Magnati payment gateway.
 */
export default class Magnati {
    /**
     * Initialize a payment transaction with Magnati.
     * @param {Object} data - Data required for payment initialization.
     * @returns {Promise<Object>} - A promise that resolves to the transaction details.
     * @throws {Error} - Throws an error if payment initialization fails.
     */
    static async initPayment(data, isEdit) {
        try {
            // Use Axios to make the HTTP request
            const response = await axios({
                method: 'POST',
                url: process.env.MAGNATI_URL,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: JSON.stringify({
                    Registration: {
                        Currency: process.env.MAGNATI_CURRENCY,
                        ReturnPath: `${process.env.FRONTEND_URL}/api/${
                            isEdit ? 'verify-update' : 'verify-payment'
                        }/${data.order_id}`,
                        TransactionHint: 'CPT:Y;VCC:Y;',
                        OrderID: data.order_id,
                        Channel: 'Web',
                        Amount: data.amount,
                        Customer: process.env.MAGNATI_CUSTOMER,
                        OrderName: 'Car Booking',
                        UserName: process.env.MAGNATI_USERNAME,
                        Password: process.env.MAGNATI_PASSWORD,
                    },
                }),
            })
            return response.data.Transaction
        } catch (error) {
            throw new Error('Payment Initialization failed.')
        }
    }

    /**
     * Verify a payment transaction with Magnati.
     * @param {string} transactionId - The ID of the transaction to verify.
     * @returns {Promise<Object>} - A promise that resolves to the verified transaction details.
     * @throws {Error} - Throws an error if payment verification fails.
     */
    static async verifyPayment(transactionId) {
        try {
            // Use Axios to make the HTTP request
            const response = await axios({
                method: 'POST',
                url: process.env.MAGNATI_URL,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: JSON.stringify({
                    Finalization: {
                        TransactionID: transactionId,
                        Customer: process.env.MAGNATI_CUSTOMER,
                        UserName: process.env.MAGNATI_USERNAME,
                        Password: process.env.MAGNATI_PASSWORD,
                    },
                }),
            })
            return response.data.Transaction
        } catch (error) {
            throw new Error('Payment Verification Failed.')
        }
    }

    /**
     * Process a refund for a payment transaction with Magnati.
     * @param {string} transactionId - The ID of the transaction to refund.
     * @param {number} amount - The amount to refund.
     * @returns {Promise<Object>} - A promise that resolves to the refunded transaction details.
     * @throws {Error} - Throws an error if refund processing fails.
     */
    static async refund(transactionId, amount) {
        try {
            // Use Axios to make the HTTP request
            const response = await axios({
                method: 'POST',
                url: process.env.MAGNATI_URL,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: JSON.stringify({
                    Refund: {
                        Amount: amount,
                        Currency: process.env.MAGNATI_CURRENCY,
                        TransactionID: transactionId,
                        Customer: process.env.MAGNATI_CUSTOMER,
                        UserName: process.env.MAGNATI_USERNAME,
                        Password: process.env.MAGNATI_PASSWORD,
                    },
                }),
            })
            return response.data.Transaction
        } catch (error) {
            throw new Error('Refund Processing Failed.')
        }
    }

    /**
     * Set up a recurring payment registration with Magnati.
     * @param {Object} data - Data required for setting up recurring payment.
     * @returns {Promise<Object>} - A promise that resolves to the transaction details for the recurring payment registration.
     * @throws {Error} - Throws an error if setting up recurring payment registration fails.
     */
    static async recurringRegistration(data, isEdit) {
        try {
            // Use Axios to make the HTTP request
            const response = await axios({
                method: 'POST',
                url: process.env.MAGNATI_URL,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: JSON.stringify({
                    Registration: {
                        Customer: process.env.MAGNATI_CUSTOMER,
                        UserName: process.env.MAGNATI_USERNAME,
                        Password: process.env.MAGNATI_PASSWORD,
                        Language: 'en',
                        OrderName: 'Car Booking',
                        OrderID: data.order_id,
                        Amount: data.amount,
                        Currency: process.env.MAGNATI_CURRENCY,
                        Recurrence: {
                            Type: 'M',
                        },
                        OrderInfo: data.description,
                        TransactionHint: 'CPT:Y;VCC:Y',
                        ReturnPath: `${process.env.FRONTEND_URL}/api/${
                            isEdit ? 'verify-update' : 'verify-payment'
                        }/${data.order_id}`,
                    },
                }),
            })
            return response.data.Transaction
        } catch (error) {
            console.log(error)
            throw new Error('Recurring Payment Registration Setup Failed.')
        }
    }


        /**
     * Send Payment link.
     * @param {Object} data - Data required for setting up payment.
     * @returns {Promise<Object>} - A promise that resolves to the transaction details for the payment registration.
     * @throws {Error} - Throws an error if setting up payment fails.
     */
        static async sendPaymentLink(data) {
            try {
                // Use Axios to make the HTTP request
                const response = await axios({
                    method: 'POST',
                    url: process.env.MAGNATI_URL,
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    data: JSON.stringify({
                        Registration: {
                            Customer: process.env.MAGNATI_CUSTOMER,
                            UserName: process.env.MAGNATI_USERNAME,
                            Password: process.env.MAGNATI_PASSWORD,
                            Language: 'en',
                            OrderName: 'Car Booking',
                            OrderID: data.order_id,
                            Amount: data.amount,
                            Currency: process.env.MAGNATI_CURRENCY,
                            Recurrence: {
                                Type: 'M',
                            },
                            OrderInfo: data.description,
                            TransactionHint: 'CPT:Y;VCC:Y',
                            ReturnPath: `${process.env.FRONTEND_URL}/api/verify-payment-link/${data.order_id}`,
                        },
                    }),
                })
                return response.data.Transaction
            } catch (error) {
                throw new Error('Recurring Payment Registration Setup Failed.')
            }
        }

    /**
     * Process a recurring payment with Magnati.
     * @param {Object} data - Data required for processing recurring payment.
     * @returns {Promise<Object>} - A promise that resolves to the transaction details for the recurring payment.
     * @throws {Error} - Throws an error if processing recurring payment fails.
     */
    static async recurringPayment(data) {
        try {
            // Use Axios to make the HTTP request
            const response = await axios({
                method: 'POST',
                url: process.env.MAGNATI_URL,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                data: JSON.stringify({
                    Authorization: {
                        Currency: process.env.MAGNATI_CURRENCY,
                        TransactionHint: 'CPT:Y;VCC:Y;',
                        OrderID: data.order_id,
                        Channel: 'R',
                        Amount: data.amount,
                        Customer: process.env.MAGNATI_CUSTOMER,
                        UserName: process.env.MAGNATI_USERNAME,
                        Password: process.env.MAGNATI_PASSWORD,
                        TransactionID: data.transaction_id,
                        OrderName: 'Car Booking',
                    },
                }),
            })
            return response.data.Transaction
        } catch (error) {
            throw new Error('Recurring Payment Processing Failed.')
        }
    }
}
