import { convertTransactionsToCSV } from "../../../utils/convert-csv.js";
import { CustomValidationError } from "../../exceptions/custom-validation-error.js";
import TransactionRepository from "../../repositories/admin/transaction-repository.js";
import AddTransactionRequest from "../../requests/admin/add-transaction-request.js";
import TransactionResponse from "../../responses/transaction-response.js";
import { downloadFiles } from "../../utils/download-files.js";
import uploadMultipleFiles from "../../utils/upload-multiple-files.js";

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
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               transaction_date:
   *                 type: string
   *                 format: date
   *               subscription_id:
   *                 type: string
   *               description:
   *                 type: string
   *               transaction_currency:
   *                 type: string
   *               transaction_amount:
   *                 type: string
   *               payment_method:
   *                 type: string
   *               card_provider:
   *                 type: string
   *               card_holder_name:
   *                 type: string
   *               last_four_digits:
   *                 type: string
   *               card_expiry:
   *                 type: string
   *               license_count:
   *                 type: string
   *               next_due_date:
   *                 type: string
   *               receipts:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *                 description: Optional PDF or image receipt
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
      

      if(req.files && req.files.receipts) {
        const fileArray = Array.isArray(req.files.receipts)
          ? req.files.receipts
          : [req.files.receipts];

        try {
          const uploadedFiles = await uploadMultipleFiles(fileArray, 'receipts');

          validatedData.receipts = uploadedFiles.map(file => file.path);
        }catch(uploadError){
          throw new Error(`File upload failed: ${uploadError.message}`);
        }
      }

      const transactionDetails = await transactionRepo.addTransaction(validatedData);

      if(transactionDetails){
        const transactionData = await TransactionResponse.format(transactionDetails);

        return res.status(200).json({
          status: true,
          message: "Transaction added successfully.",
          data: transactionData,
        });
      }else{
        return res.status(422).json({
          status: false,
          message: "Failed to add transaction.",
          data: [],
        });
      }
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
   * Download Transactions CSV
   *
   * @swagger
   * /transaction/download:
   *   post:
   *     tags:
   *       - Transaction
   *     summary: Download transactions as CSV
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               include_deleted:
   *                 type: boolean
   *                 description: Include soft deleted transactions
   *     responses:
   *       200:
   *         description: CSV file download
   *       500:
   *         description: Internal Server Error
   */
  async downloadTransactionsCSV(req, res) {
    try {
      const includeDeleted = req.body.include_deleted === true;

      const { transactions } = includeDeleted
        ? await transactionRepo.getAllTransactionsWithDeleted()
        : await transactionRepo.getAllTransactions();

      const formattedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const formatted = await TransactionResponse.format(transaction);
          return {
            transactionDate: formatted.transaction_date,
            subscriptionName:
              transaction.subscription_id?.subscription_name || "N/A",
            description: formatted.description,
            transactionCurrency: formatted.transaction_currency,
            transaction_amount: formatted.transaction_amount,
            paymentMethod: transaction.payment_method?.payment_method || "N/A",
            cardProvider: formatted.card_provider,
            cardHolderName: formatted.card_holder_name,
            cardLastFour: formatted.last_four_digits,
            cardExpiryDate: formatted.card_expiry,
            licenseCount: transaction.license_count?.license_count || "N/A",
            nextDueDate: formatted.next_due_date,
          };
        })
      );

      const csvContent = convertTransactionsToCSV(formattedTransactions);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.csv"
      );
      res.send(csvContent);
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Failed to download transactions.",
        errors: error.message || error,
      });
    }
  }

  /**
 * Download Receipts for a Transaction
 *
 * @swagger
 * /transaction/download-receipts:
 *   post:
 *     tags:
 *       - Transaction
 *     summary: Download receipts for a specific transaction
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: The ID of the transaction to download receipts for
 *             required:
 *               - transactionId
 *     responses:
 *       200:
 *         description: Receipts downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Transaction or receipts not found
 *       500:
 *         description: Internal Server Error
 */
  async downloadTransactionReceipts(req, res) {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({
                status: false,
                message: "Transaction ID is required.",
            });
        }

        // Fetch the transaction
        const transaction = await transactionRepo.getTransactionById(transactionId);

        if (!transaction || !transaction.receipts || transaction.receipts.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Transaction or receipts not found.",
            });
        }

        // Use the utility to download receipts (direct stream)
        const zipFileName = `transaction_${transactionId}_receipts.zip`;
        await downloadFiles(transaction.receipts, zipFileName, res);
    } catch (error) {
        console.error("Error downloading receipts:", error);

        res.status(500).json({
            status: false,
            message: "Failed to download receipts.",
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
