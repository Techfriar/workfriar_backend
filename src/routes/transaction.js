import express from "express";
import { checkPermissions } from "../middlewares/check-permission.js";
import TransactionController from "../controllers/admin/transaction-controller.js";
import multer from "multer";

const upload = multer();

const transactionRouter = express.Router();
const transaction = new TransactionController();

// Add new transaction
transactionRouter.route("/add").post(
  upload.fields([{ name: "receipts", maxCount: 10 }]), // Define the "receipts" field explicitly
  transaction.addTransaction
);

// Get all transactions
transactionRouter.route("/list").post(transaction.getAllTransactions);

// Get transaction by ID
transactionRouter.route("/get/:id").post(transaction.getTransactionById);

// Soft delete transaction
transactionRouter.route("/delete/:id").post(transaction.softDeleteTransaction);

// Restore soft deleted transaction
transactionRouter.route("/restore/:id").post(transaction.restoreTransaction);

transactionRouter.route("/download").post(transaction.downloadTransactionsCSV);

transactionRouter
  .route("/download-receipts")
  .post(transaction.downloadTransactionReceipts);

transactionRouter
  .route("/list-by-subscription")
  .post(transaction.getTransactionsBySubscription);
  
export default transactionRouter;
