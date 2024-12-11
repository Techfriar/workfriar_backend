export default class TransactionResponse{
    /**
     * 
     * @param {Object} transaction
     * @param {Object}
     */

    static async format(transaction) {
        return {
            id: transaction._id,
            transaction_date: transaction.transaction_date,
            subscription_id: transaction.subscription_id,
            description: transaction.description,
            amount: transaction.amount,
            payment_method: transaction.payment_method,
            card_provider: transaction.card_provider,
            card_holder_name: transaction.card_holder_name,
            last_four_digits: transaction.last_four_digits,
            card_expiry: transaction.card_expiry,
            license_count: transaction.license_count,
            next_due_date: transaction.next_due_date,
            is_deleted: transaction.is_deleted,
            deleted_at: transaction.deleted_at,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        };
    }
}