import express from "express";
import { checkPermissions } from "../middlewares/check-permission.js";
import TransactionController from "../controllers/admin/transaction-controller.js";

const transactionRouter = express.Router();
const transaction = new TransactionController();

// Add new transaction
transactionRouter
  .route("/add")
  .post(
    transaction.addTransaction
  );

// Get all transactions
transactionRouter
  .route("/list")
  .post(
    transaction.getAllTransactions
  );

// Get transaction by ID
transactionRouter
  .route("/get/:id")
  .post(
    transaction.getTransactionById
  );

// Soft delete transaction
transactionRouter
  .route("/delete/:id")
  .post(
    transaction.softDeleteTransaction
  );

// Restore soft deleted transaction
transactionRouter
  .route("/restore/:id")
  .post(
    transaction.restoreTransaction
  );

export default transactionRouter;