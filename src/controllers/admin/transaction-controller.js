import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import TransactionRepository from "../../repositories/admin/transaction-repository.js";
import AddTransactionRequest from "../../requests/admin/add-transaction-request.js";
import TransactionResponse from "../../responses/transaction-response.js";

const transactionRepo = new TransactionRepository();

export default class TransactionController {
  /**
   * Add Transaction
   *
   * @swagger
   * /transaction/add:
   *   post:
   *     tags:
   *       - Transaction
   *     summary: Add transaction
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               transaction_date:
   *                 type: string
   *                 format: date
   *                 description: Enter transaction date
   *               subscription_id:
   *                 type: string
   *                 description: Enter subscription ID
   *               description:
   *                 type: string
   *                 description: Enter description
   *               amount:
   *                 type: string
   *                 description: Enter amount
   *               payment_method:
   *                 type: string
   *                 description: Enter payment method
   *               card_provider:
   *                 type: string
   *                 description: Enter card provider name
   *               card_holder_name:
   *                 type: string
   *                 description: Enter card holder name
   *               last_four_digits:
   *                 type: string
   *                 pattern: '^\d{4}$'
   *                 description: Enter last four digits of the card
   *               card_expiry:
   *                 type: string
   *                 pattern: '^(0[1-9]|1[0-2])\/([0-9]{2})$'
   *                 description: Enter card expiry date (MM/YY)
   *               license_count:
   *                 type: string
   *                 description: Enter number of licenses
   *               next_due_date:
   *                 type: string
   *                 format: date
   *                 description: Enter next payment due date
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async addTransaction(req, res) {
    try {
      const validatedData = await new AddTransactionRequest(req).validate();
      const transactionDetails = await transactionRepo.addTransaction(
        validatedData
      );

      if (!transactionDetails) {
        return res.status(422).json({
          status: false,
          message: "Failed to add transaction.",
          data: null,
        });
      }

      const transactionData = await TransactionResponse.format(
        transactionDetails
      );
      return res.status(200).json({
        status: true,
        message: "Transaction added successfully.",
        data: transactionData,
      });
    } catch (error) {
      if (error instanceof CustomValidationError) {
        return res.status(422).json({
          status: false,
          message: "Validation failed.",
          errors: error.errors,
        });
      }

      return res.status(500).json({
        status: false,
        message: "Failed to add transaction.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Get all transactions
   *
   * @swagger
   * /transaction/list:
   *   post:
   *     tags:
   *       - Transaction
   *     summary: Get all transactions
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: include_deleted
   *         schema:
   *           type: boolean
   *         description: Include soft deleted transactions
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async getAllTransactions(req, res) {
    try {
      const includeDeleted = req.query.include_deleted === "true";

      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const { transactions, total } = includeDeleted
        ? await transactionRepo.getAllTransactionsWithDeleted(page, limit)
        : await transactionRepo.getAllTransactions(page, limit);

      const formattedTransactions = await Promise.all(
        transactions.map(
          async (transaction) => await TransactionResponse.format(transaction)
        )
      );

      return res.status(200).json({
        status: true,
        message: "Transactions retrieved successfully.",
        data: {
          transactions: formattedTransactions,
          pagination: {
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            perPage: limit,
          },
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve transactions.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Get Transaction By Id
   *
   * @swagger
   * /transaction/get/{id}:
   *   post:
   *     tags:
   *       - Transaction
   *     summary: Get transaction by id
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Bad Request
   *       500:
   *         description: Internal Server Error
   */
  async getTransactionById(req, res) {
    try {
      const transaction = await transactionRepo.getTransactionById(
        req.params.id
      );

      if (!transaction) {
        return res.status(404).json({
          status: false,
          message: "Transaction not found.",
          data: null,
        });
      }

      const transactionData = await TransactionResponse.format(transaction);
      return res.status(200).json({
        status: true,
        message: "Transaction retrieved successfully.",
        data: transactionData,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to retrieve transaction.",
        errors: {
          details: error.message || "Unknown error occurred",
          code: error.code || "UNKNOWN_ERROR",
        },
      });
    }
  }

  /**
   * Delete Transaction
   *
   * @swagger
   * /transaction/delete/{id}:
   *   post:
   *     tags:
   *       - Transaction
   *     summary: Soft delete transaction
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal Server Error
   */
  async softDeleteTransaction(req, res) {
    try {
      const transaction = await transactionRepo.softDeleteTransaction(
        req.params.id
      );

      if (!transaction) {
        return res.status(404).json({
          status: false,
          message: "Transaction not found.",
          data: null,
        });
      }

      const transactionData = await TransactionResponse.format(transaction);
      return res.status(200).json({
        status: true,
        message: "Transaction deleted successfully.",
        data: transactionData,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to delete transaction.",
        errors: error.message || error,
      });
    }
  }

  /**
   * Restore Transaction
   *
   * @swagger
   * /transaction/restore/{id}:
   *   post:
   *     tags:
   *       - Transaction
   *     summary: Restore soft deleted transaction
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Transaction ID
   *     responses:
   *       200:
   *         description: Success
   *       404:
   *         description: Not Found
   *       500:
   *         description: Internal Server Error
   */
  async restoreTransaction(req, res) {
    try {
      const transaction = await transactionRepo.restoreTransaction(
        req.params.id
      );

      if (!transaction) {
        return res.status(404).json({
          status: false,
          message: "Transaction not found.",
          data: null,
        });
      }

      const transactionData = await TransactionResponse.format(transaction);
      return res.status(200).json({
        status: true,
        message: "Transaction restored successfully.",
        data: transactionData,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to restore transaction.",
        errors: error.message || error,
      });
    }
  }
}
