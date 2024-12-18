import moment from "moment";
import { generateFileUrl } from "../utils/generateFileUrl.js";

export default class TransactionResponse{

    static formatDate(date) {
        if (!date) return null;
        return moment(date).format("DD/MMM/YYYY");
    }
    /**
     * 
     * @param {Object} transaction
     * @param {Object}
     */

    static async format(transaction) {
        return {
            id: transaction._id,
            transaction_date: this.formatDate(transaction.transaction_date),
            subscription_name: transaction.subscription_name?.subscription_name,
            description: transaction.description,
            transaction_currency: transaction.transaction_currency,
            transaction_amount: transaction.transaction_amount,
            payment_method: transaction.payment_method,
            card_provider: transaction.card_provider,
            card_holder_name: transaction.card_holder_name,
            last_four_digits: transaction.last_four_digits,
            card_expiry: transaction.card_expiry,
            license_count: transaction.license_count.license_count,
            next_due_date: this.formatDate(transaction.next_due_date) || null,
            is_deleted: transaction.is_deleted,
            deleted_at: transaction.deleted_at,
            receipts: Array.isArray(transaction.receipts) ? transaction.receipts.map(receipt => generateFileUrl(receipt)) : transaction.receipts ? [generateFileUrl(transaction.receipts)] : [],
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };
    }
}