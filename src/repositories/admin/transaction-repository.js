import mongoose from "mongoose";
import Subscription from "../../models/admin/subscriptions.js";
import Transaction from "../../models/admin/transactions.js";

export default class TransactionRepository {
    /**
     * Check if subscription exists
     * @param {String} subscriptionId - The subscription id to check
     * @return {Promise<boolean>} - True if subscription exists, false otherwise
     * @throws {Error} If there's an error checking the subscription
     */
    async checkSubscriptionExists(subscriptionId) {
        try {
            const subscription = await Subscription.findById(subscriptionId);
            return !!subscription;
        } catch (error) {
            throw new Error(`Error checking subscription existence: ${error.message}`);
        }
    }

    /**
     * Add a new transaction
     * @param {Object} transactionData - The transaction data
     * @return {Promise} - The created transaction
     */
    async addTransaction(transactionData) {
        try {
            if (transactionData.subscriptionId) {
                const subscriptionExists = await this.checkSubscriptionExists(transactionData.subscriptionId);
                if (!subscriptionExists) {
                    throw new Error(`Subscription with ID ${transactionData.subscriptionId} not found`);
                }
            }

            const transaction = new Transaction(transactionData);
            return await transaction.save();
        } catch (error) {
            throw new Error(`Error adding transaction: ${error.message}`);
        }
    }

     /**
     * Get all transactions (excluding soft deleted) with pagination
     * @param {number} page - Current page number
     * @param {number} limit - Number of items per page
     * @return {Promise<{transactions: Transaction[], total: number}>}
     */
     async getAllTransactions(page, limit) {
        try {
            const skip = (page - 1) * limit;

            const [transactions, total] = await Promise.all([
                Transaction.find({ is_deleted: false })
                    .populate({
                        path: 'subscription_id',
                        select: 'subscription_name'
                    })
                    .populate('license_count', 'license_count')
                    .populate('payment_method', 'payment_method')
                    .populate('next_due_date', 'next_due_date')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Transaction.countDocuments({ is_deleted: false })
            ]);

            return { transactions, total };
        } catch (error) {
            throw new Error(`Error fetching transactions: ${error.message}`);
        }
    }

    /**
     * Get all transactions including soft deleted with pagination
     * @param {number} page - Current page number
     * @param {number} limit - Number of items per page
     * @return {Promise<{transactions: Transaction[], total: number}>}
     */
    async getAllTransactionsWithDeleted(page, limit) {
        try {
            const skip = (page - 1) * limit;

            const [transactions, total] = await Promise.all([
                Transaction.find()
                    .populate({
                        path: 'subscription_id',
                        select: 'subscription_name'
                    })
                    .populate('license_count', 'license_count')
                    .populate('payment_method', 'payment_method')
                    .populate('next_due_date', 'next_due_date')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Transaction.countDocuments()
            ]);

            return { transactions, total };
        } catch (error) {
            throw new Error(`Error fetching transactions: ${error.message}`);
        }
    }

    /**
     * Get transaction by id with populated subscription data
     * @param {String} transactionId - The transaction id
     * @return {Promise<Transaction>} - The transaction with subscription details
     */
    async getTransactionById(transactionId) {
        try {
            const transaction = await Transaction.findById(transactionId)
                .populate({
                    path: 'subscription_id',
                    select: 'subscription_name'
                })
                .populate('license_count', 'license_count')
                .populate('payment_method', 'payment_method')
                .populate('next_due_date', 'next_due_date');

            if (!transaction) {
                throw new Error(`Transaction with ID ${transactionId} not found`);
            }
            return transaction;
        } catch (error) {
            throw new Error(`Error fetching transaction by ID: ${error.message}`);
        }
    }

    /**
     * Soft delete a transaction
     * @param {String} transactionId - The transaction id to delete
     * @return {Promise<Transaction>} - The soft deleted transaction
     */
    async softDeleteTransaction(transactionId) {
        try {
            const transaction = await Transaction.findById(transactionId);
            if (!transaction) {
                throw new Error(`Transaction with ID ${transactionId} not found`);
            }
            
            transaction.is_deleted = true;
            transaction.deleted_at = new Date();
            return await transaction.save();
        } catch (error) {
            throw new Error(`Error soft deleting transaction: ${error.message}`);
        }
    }

    /**
     * Restore a soft deleted transaction
     * @param {String} transactionId - The transaction id to restore
     * @return {Promise<Transaction>} - The restored transaction
     */
    async restoreTransaction(transactionId) {
        try {
            const transaction = await Transaction.findOne({
                _id: transactionId,
                is_deleted: true
            });
            
            if (!transaction) {
                throw new Error(`Deleted transaction with ID ${transactionId} not found`);
            }

            transaction.is_deleted = false;
            transaction.deleted_at = null;
            return await transaction.save();
        } catch (error) {
            throw new Error(`Error restoring transaction: ${error.message}`);
        }
    }
}